import { Queue, Job } from 'bull';
import { WhatsAppService } from '../../whatsapp/services/WhatsAppService';
import { Campaign, ICampaign } from '../../shared/models/Campaign';
import { WhatsAppMessage } from '../../shared/models/WhatsAppMessage';
import { Contact } from '../../contacts/models/Contact';
import { logger } from '../../shared/utils/logger';
import Redis from 'redis';

export interface BroadcastJobData {
  campaignId: string;
  organizationId: string;
  contactId: string;
  message: any;
  retryCount?: number;
}

export interface RateLimitConfig {
  messagesPerSecond: number;
  messagesPerMinute: number;
  messagesPerHour: number;
}

export class BroadcastService {
  private broadcastQueue: Queue;
  private redisClient: Redis.RedisClientType;
  private rateLimitConfig: RateLimitConfig;
  private activeWorkers: Map<string, any> = new Map();

  constructor() {
    this.redisClient = Redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });

    this.broadcastQueue = new (require('bull').Queue)('broadcast', {
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379')
      },
      defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 50,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000
        }
      }
    });

    this.rateLimitConfig = {
      messagesPerSecond: 1,
      messagesPerMinute: 60,
      messagesPerHour: 1000
    };

    this.setupQueue();
    this.setupRateLimiting();
  }

  private async setupQueue(): Promise<void> {
    try {
      await this.redisClient.connect();
      
      // Process broadcast jobs with rate limiting
      const worker = new (require('bull').Worker)('broadcast', async (job: Job<BroadcastJobData>) => {
        await this.processBroadcastJob(job);
      }, {
        concurrency: 1, // Process one message at a time to respect rate limits
        limiter: {
          max: this.rateLimitConfig.messagesPerMinute,
          duration: 60000 // 1 minute
        }
      });

      worker.on('completed', (job: any) => {
        logger.info(`Broadcast job completed: ${job.id}`);
      });

      worker.on('failed', (job: any, err: any) => {
        logger.error(`Broadcast job failed: ${job?.id}`, err);
      });

      this.activeWorkers.set('broadcast', worker);
    } catch (error) {
      logger.error('Failed to setup broadcast queue:', error);
      throw error;
    }
  }

  private async setupRateLimiting(): Promise<void> {
    // Setup rate limiting using Redis
    setInterval(async () => {
      await this.cleanupRateLimitCounters();
    }, 60000); // Clean up every minute
  }

  public async startCampaign(campaignId: string): Promise<void> {
    try {
      const campaign = await Campaign.findById(campaignId);
      if (!campaign) {
        throw new Error('Campaign not found');
      }

      if (campaign.status !== 'draft' && campaign.status !== 'scheduled') {
        throw new Error('Campaign cannot be started in current status');
      }

      // Update campaign status
      campaign.status = 'running';
      campaign.analytics.startTime = new Date();
      await campaign.save();

      // Get recipients based on campaign configuration
      const recipients = await this.getCampaignRecipients(campaign);
      campaign.analytics.totalRecipients = recipients.length;
      await campaign.save();

      // Queue messages for sending
      await this.queueCampaignMessages(campaign, recipients);

      logger.info(`Campaign ${campaignId} started with ${recipients.length} recipients`);
    } catch (error) {
      logger.error('Failed to start campaign:', error);
      throw error;
    }
  }

  private async getCampaignRecipients(campaign: ICampaign): Promise<any[]> {
    try {
      let recipients: any[] = [];

      switch (campaign.recipients.type) {
        case 'all':
          recipients = await Contact.find({
            organizationId: campaign.organizationId,
            isActive: true,
            optOut: { $ne: true }
          }).select('_id phoneNumber firstName lastName');
          break;

        case 'segment':
          // Implement segment-based recipient selection
          recipients = await Contact.find({
            organizationId: campaign.organizationId,
            isActive: true,
            optOut: { $ne: true },
            // Add segment criteria here
          }).select('_id phoneNumber firstName lastName');
          break;

        case 'list':
          if (campaign.recipients.contacts) {
            recipients = await Contact.find({
              _id: { $in: campaign.recipients.contacts },
              organizationId: campaign.organizationId,
              isActive: true,
              optOut: { $ne: true }
            }).select('_id phoneNumber firstName lastName');
          }
          break;
      }

      return recipients;
    } catch (error) {
      logger.error('Failed to get campaign recipients:', error);
      throw error;
    }
  }

  private async queueCampaignMessages(campaign: ICampaign, recipients: any[]): Promise<void> {
    try {
      const jobs: any[] = [];

      for (const recipient of recipients) {
        const jobData: BroadcastJobData = {
          campaignId: campaign._id,
          organizationId: campaign.organizationId,
          contactId: recipient._id,
          message: campaign.message,
          retryCount: 0
        };

        jobs.push({
          name: 'broadcast-message',
          data: jobData,
          delay: this.calculateMessageDelay(jobs.length, campaign.settings.rateLimit)
        });
      }

      await this.broadcastQueue.addBulk(jobs);
      logger.info(`Queued ${jobs.length} messages for campaign ${campaign._id}`);
    } catch (error) {
      logger.error('Failed to queue campaign messages:', error);
      throw error;
    }
  }

  private calculateMessageDelay(messageIndex: number, rateLimit: any): number {
    // Calculate delay based on rate limits
    const messagesPerSecond = rateLimit.messagesPerSecond || 1;
    const delayBetweenMessages = 1000 / messagesPerSecond; // milliseconds
    
    return messageIndex * delayBetweenMessages;
  }

  private async processBroadcastJob(job: Job<BroadcastJobData>): Promise<void> {
    try {
      const { campaignId, organizationId, contactId, message } = job.data;

      // Check rate limits
      const canSend = await this.checkRateLimit(organizationId);
      if (!canSend) {
        throw new Error('Rate limit exceeded');
      }

      // Get contact details
      const contact = await Contact.findById(contactId);
      if (!contact || contact.status !== 'active' || contact.optOut) {
        logger.warn(`Skipping inactive or opted-out contact: ${contactId}`);
        return;
      }

      // Get WhatsApp service for organization
      const whatsappService = this.getWhatsAppService(organizationId);

      // Send message
      await whatsappService.sendMessage({
        to: contact.phoneNumber,
        type: message.type,
        content: message.content,
        organizationId,
        campaignId,
        conversationId: contact.conversationId
      });

      // Update campaign analytics
      await this.updateCampaignAnalytics(campaignId, 'sent');

      logger.info(`Message sent to contact ${contactId} for campaign ${campaignId}`);
    } catch (error) {
      logger.error('Failed to process broadcast job:', error);
      
      // Update campaign analytics
      await this.updateCampaignAnalytics(job.data.campaignId, 'failed');
      
      throw error;
    }
  }

  private async checkRateLimit(organizationId: string): Promise<boolean> {
    try {
      const now = Date.now();
      const minute = Math.floor(now / 60000);
      const hour = Math.floor(now / 3600000);

      // Check per-minute limit
      const minuteKey = `rate_limit:${organizationId}:minute:${minute}`;
      const minuteCount = await this.redisClient.get(minuteKey);
      
      if (minuteCount && parseInt(minuteCount) >= this.rateLimitConfig.messagesPerMinute) {
        return false;
      }

      // Check per-hour limit
      const hourKey = `rate_limit:${organizationId}:hour:${hour}`;
      const hourCount = await this.redisClient.get(hourKey);
      
      if (hourCount && parseInt(hourCount) >= this.rateLimitConfig.messagesPerHour) {
        return false;
      }

      // Increment counters
      await this.redisClient.incr(minuteKey);
      await this.redisClient.expire(minuteKey, 60); // Expire after 1 minute

      await this.redisClient.incr(hourKey);
      await this.redisClient.expire(hourKey, 3600); // Expire after 1 hour

      return true;
    } catch (error) {
      logger.error('Rate limit check failed:', error);
      return false;
    }
  }

  private async cleanupRateLimitCounters(): Promise<void> {
    try {
      // This would clean up expired rate limit counters
      // Implementation depends on your Redis setup
    } catch (error) {
      logger.error('Failed to cleanup rate limit counters:', error);
    }
  }

  private getWhatsAppService(organizationId: string): WhatsAppService {
    // Get WhatsApp configuration for organization
    const config = {
      accessToken: process.env.WHATSAPP_ACCESS_TOKEN!,
      phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID!,
      businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID!,
      webhookVerifyToken: process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN!
    };

    return new WhatsAppService(config);
  }

  private async updateCampaignAnalytics(campaignId: string, metric: string): Promise<void> {
    try {
      const updateField = `analytics.${metric}`;
      await Campaign.findByIdAndUpdate(campaignId, {
        $inc: { [updateField]: 1 }
      });
    } catch (error) {
      logger.error('Failed to update campaign analytics:', error);
    }
  }

  public async pauseCampaign(campaignId: string): Promise<void> {
    try {
      await Campaign.findByIdAndUpdate(campaignId, {
        status: 'paused'
      });

      // Pause all pending jobs for this campaign
      const jobs = await this.broadcastQueue.getJobs(['waiting', 'delayed']);
      for (const job of jobs) {
        if (job.data.campaignId === campaignId) {
          await job.remove();
        }
      }

      logger.info(`Campaign ${campaignId} paused`);
    } catch (error) {
      logger.error('Failed to pause campaign:', error);
      throw error;
    }
  }

  public async resumeCampaign(campaignId: string): Promise<void> {
    try {
      const campaign = await Campaign.findById(campaignId);
      if (!campaign) {
        throw new Error('Campaign not found');
      }

      campaign.status = 'running';
      await campaign.save();

      logger.info(`Campaign ${campaignId} resumed`);
    } catch (error) {
      logger.error('Failed to resume campaign:', error);
      throw error;
    }
  }

  public async cancelCampaign(campaignId: string): Promise<void> {
    try {
      await Campaign.findByIdAndUpdate(campaignId, {
        status: 'cancelled',
        'analytics.endTime': new Date()
      });

      // Cancel all pending jobs for this campaign
      const jobs = await this.broadcastQueue.getJobs(['waiting', 'delayed', 'active']);
      for (const job of jobs) {
        if (job.data.campaignId === campaignId) {
          await job.remove();
        }
      }

      logger.info(`Campaign ${campaignId} cancelled`);
    } catch (error) {
      logger.error('Failed to cancel campaign:', error);
      throw error;
    }
  }

  public async getCampaignStatus(campaignId: string): Promise<any> {
    try {
      const campaign = await Campaign.findById(campaignId);
      if (!campaign) {
        throw new Error('Campaign not found');
      }

      // Get queue statistics
      const waiting = await this.broadcastQueue.getWaiting();
      const active = await this.broadcastQueue.getActive();
      const completed = await this.broadcastQueue.getCompleted();
      const failed = await this.broadcastQueue.getFailed();

      const campaignJobs = [...waiting, ...active, ...completed, ...failed]
        .filter(job => job.data.campaignId === campaignId);

      return {
        campaign,
        queueStats: {
          waiting: campaignJobs.filter(job => (job.opts.delay || 0) > 0).length,
          active: campaignJobs.filter(job => job.processedOn && !job.finishedOn).length,
          completed: campaignJobs.filter(job => job.finishedOn && !job.failedReason).length,
          failed: campaignJobs.filter(job => job.failedReason).length
        }
      };
    } catch (error) {
      logger.error('Failed to get campaign status:', error);
      throw error;
    }
  }

  public async updateRateLimitConfig(config: RateLimitConfig): Promise<void> {
    this.rateLimitConfig = config;
    logger.info('Rate limit configuration updated:', config);
  }

  public async getQueueStats(): Promise<any> {
    try {
      const waiting = await this.broadcastQueue.getWaiting();
      const active = await this.broadcastQueue.getActive();
      const completed = await this.broadcastQueue.getCompleted();
      const failed = await this.broadcastQueue.getFailed();

      return {
        waiting: waiting.length,
        active: active.length,
        completed: completed.length,
        failed: failed.length,
        total: waiting.length + active.length + completed.length + failed.length
      };
    } catch (error) {
      logger.error('Failed to get queue stats:', error);
      throw error;
    }
  }
}
