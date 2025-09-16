"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BroadcastService = void 0;
const WhatsAppService_1 = require("../../whatsapp/services/WhatsAppService");
const Campaign_1 = require("../../shared/models/Campaign");
const Contact_1 = require("../../contacts/models/Contact");
const logger_1 = require("../../shared/utils/logger");
const redis_1 = __importDefault(require("redis"));
class BroadcastService {
    constructor() {
        this.activeWorkers = new Map();
        this.redisClient = redis_1.default.createClient({
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
    async setupQueue() {
        try {
            await this.redisClient.connect();
            const worker = new (require('bull').Worker)('broadcast', async (job) => {
                await this.processBroadcastJob(job);
            }, {
                concurrency: 1,
                limiter: {
                    max: this.rateLimitConfig.messagesPerMinute,
                    duration: 60000
                }
            });
            worker.on('completed', (job) => {
                logger_1.logger.info(`Broadcast job completed: ${job.id}`);
            });
            worker.on('failed', (job, err) => {
                logger_1.logger.error(`Broadcast job failed: ${job?.id}`, err);
            });
            this.activeWorkers.set('broadcast', worker);
        }
        catch (error) {
            logger_1.logger.error('Failed to setup broadcast queue:', error);
            throw error;
        }
    }
    async setupRateLimiting() {
        setInterval(async () => {
            await this.cleanupRateLimitCounters();
        }, 60000);
    }
    async startCampaign(campaignId) {
        try {
            const campaign = await Campaign_1.Campaign.findById(campaignId);
            if (!campaign) {
                throw new Error('Campaign not found');
            }
            if (campaign.status !== 'draft' && campaign.status !== 'scheduled') {
                throw new Error('Campaign cannot be started in current status');
            }
            campaign.status = 'running';
            campaign.analytics.startTime = new Date();
            await campaign.save();
            const recipients = await this.getCampaignRecipients(campaign);
            campaign.analytics.totalRecipients = recipients.length;
            await campaign.save();
            await this.queueCampaignMessages(campaign, recipients);
            logger_1.logger.info(`Campaign ${campaignId} started with ${recipients.length} recipients`);
        }
        catch (error) {
            logger_1.logger.error('Failed to start campaign:', error);
            throw error;
        }
    }
    async getCampaignRecipients(campaign) {
        try {
            let recipients = [];
            switch (campaign.recipients.type) {
                case 'all':
                    recipients = await Contact_1.Contact.find({
                        organizationId: campaign.organizationId,
                        isActive: true,
                        optOut: { $ne: true }
                    }).select('_id phoneNumber firstName lastName');
                    break;
                case 'segment':
                    recipients = await Contact_1.Contact.find({
                        organizationId: campaign.organizationId,
                        isActive: true,
                        optOut: { $ne: true },
                    }).select('_id phoneNumber firstName lastName');
                    break;
                case 'list':
                    if (campaign.recipients.contacts) {
                        recipients = await Contact_1.Contact.find({
                            _id: { $in: campaign.recipients.contacts },
                            organizationId: campaign.organizationId,
                            isActive: true,
                            optOut: { $ne: true }
                        }).select('_id phoneNumber firstName lastName');
                    }
                    break;
            }
            return recipients;
        }
        catch (error) {
            logger_1.logger.error('Failed to get campaign recipients:', error);
            throw error;
        }
    }
    async queueCampaignMessages(campaign, recipients) {
        try {
            const jobs = [];
            for (const recipient of recipients) {
                const jobData = {
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
            logger_1.logger.info(`Queued ${jobs.length} messages for campaign ${campaign._id}`);
        }
        catch (error) {
            logger_1.logger.error('Failed to queue campaign messages:', error);
            throw error;
        }
    }
    calculateMessageDelay(messageIndex, rateLimit) {
        const messagesPerSecond = rateLimit.messagesPerSecond || 1;
        const delayBetweenMessages = 1000 / messagesPerSecond;
        return messageIndex * delayBetweenMessages;
    }
    async processBroadcastJob(job) {
        try {
            const { campaignId, organizationId, contactId, message } = job.data;
            const canSend = await this.checkRateLimit(organizationId);
            if (!canSend) {
                throw new Error('Rate limit exceeded');
            }
            const contact = await Contact_1.Contact.findById(contactId);
            if (!contact || contact.status !== 'active' || contact.optOut) {
                logger_1.logger.warn(`Skipping inactive or opted-out contact: ${contactId}`);
                return;
            }
            const whatsappService = this.getWhatsAppService(organizationId);
            await whatsappService.sendMessage({
                to: contact.phoneNumber,
                type: message.type,
                content: message.content,
                organizationId,
                campaignId,
                conversationId: contact.conversationId
            });
            await this.updateCampaignAnalytics(campaignId, 'sent');
            logger_1.logger.info(`Message sent to contact ${contactId} for campaign ${campaignId}`);
        }
        catch (error) {
            logger_1.logger.error('Failed to process broadcast job:', error);
            await this.updateCampaignAnalytics(job.data.campaignId, 'failed');
            throw error;
        }
    }
    async checkRateLimit(organizationId) {
        try {
            const now = Date.now();
            const minute = Math.floor(now / 60000);
            const hour = Math.floor(now / 3600000);
            const minuteKey = `rate_limit:${organizationId}:minute:${minute}`;
            const minuteCount = await this.redisClient.get(minuteKey);
            if (minuteCount && parseInt(minuteCount) >= this.rateLimitConfig.messagesPerMinute) {
                return false;
            }
            const hourKey = `rate_limit:${organizationId}:hour:${hour}`;
            const hourCount = await this.redisClient.get(hourKey);
            if (hourCount && parseInt(hourCount) >= this.rateLimitConfig.messagesPerHour) {
                return false;
            }
            await this.redisClient.incr(minuteKey);
            await this.redisClient.expire(minuteKey, 60);
            await this.redisClient.incr(hourKey);
            await this.redisClient.expire(hourKey, 3600);
            return true;
        }
        catch (error) {
            logger_1.logger.error('Rate limit check failed:', error);
            return false;
        }
    }
    async cleanupRateLimitCounters() {
        try {
        }
        catch (error) {
            logger_1.logger.error('Failed to cleanup rate limit counters:', error);
        }
    }
    getWhatsAppService(organizationId) {
        const config = {
            accessToken: process.env.WHATSAPP_ACCESS_TOKEN,
            phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
            businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID,
            webhookVerifyToken: process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN
        };
        return new WhatsAppService_1.WhatsAppService(config);
    }
    async updateCampaignAnalytics(campaignId, metric) {
        try {
            const updateField = `analytics.${metric}`;
            await Campaign_1.Campaign.findByIdAndUpdate(campaignId, {
                $inc: { [updateField]: 1 }
            });
        }
        catch (error) {
            logger_1.logger.error('Failed to update campaign analytics:', error);
        }
    }
    async pauseCampaign(campaignId) {
        try {
            await Campaign_1.Campaign.findByIdAndUpdate(campaignId, {
                status: 'paused'
            });
            const jobs = await this.broadcastQueue.getJobs(['waiting', 'delayed']);
            for (const job of jobs) {
                if (job.data.campaignId === campaignId) {
                    await job.remove();
                }
            }
            logger_1.logger.info(`Campaign ${campaignId} paused`);
        }
        catch (error) {
            logger_1.logger.error('Failed to pause campaign:', error);
            throw error;
        }
    }
    async resumeCampaign(campaignId) {
        try {
            const campaign = await Campaign_1.Campaign.findById(campaignId);
            if (!campaign) {
                throw new Error('Campaign not found');
            }
            campaign.status = 'running';
            await campaign.save();
            logger_1.logger.info(`Campaign ${campaignId} resumed`);
        }
        catch (error) {
            logger_1.logger.error('Failed to resume campaign:', error);
            throw error;
        }
    }
    async cancelCampaign(campaignId) {
        try {
            await Campaign_1.Campaign.findByIdAndUpdate(campaignId, {
                status: 'cancelled',
                'analytics.endTime': new Date()
            });
            const jobs = await this.broadcastQueue.getJobs(['waiting', 'delayed', 'active']);
            for (const job of jobs) {
                if (job.data.campaignId === campaignId) {
                    await job.remove();
                }
            }
            logger_1.logger.info(`Campaign ${campaignId} cancelled`);
        }
        catch (error) {
            logger_1.logger.error('Failed to cancel campaign:', error);
            throw error;
        }
    }
    async getCampaignStatus(campaignId) {
        try {
            const campaign = await Campaign_1.Campaign.findById(campaignId);
            if (!campaign) {
                throw new Error('Campaign not found');
            }
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
        }
        catch (error) {
            logger_1.logger.error('Failed to get campaign status:', error);
            throw error;
        }
    }
    async updateRateLimitConfig(config) {
        this.rateLimitConfig = config;
        logger_1.logger.info('Rate limit configuration updated:', config);
    }
    async getQueueStats() {
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
        }
        catch (error) {
            logger_1.logger.error('Failed to get queue stats:', error);
            throw error;
        }
    }
}
exports.BroadcastService = BroadcastService;
//# sourceMappingURL=BroadcastService.js.map