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
export declare class BroadcastService {
    private broadcastQueue;
    private redisClient;
    private rateLimitConfig;
    private activeWorkers;
    constructor();
    private setupQueue;
    private setupRateLimiting;
    startCampaign(campaignId: string): Promise<void>;
    private getCampaignRecipients;
    private queueCampaignMessages;
    private calculateMessageDelay;
    private processBroadcastJob;
    private checkRateLimit;
    private cleanupRateLimitCounters;
    private getWhatsAppService;
    private updateCampaignAnalytics;
    pauseCampaign(campaignId: string): Promise<void>;
    resumeCampaign(campaignId: string): Promise<void>;
    cancelCampaign(campaignId: string): Promise<void>;
    getCampaignStatus(campaignId: string): Promise<any>;
    updateRateLimitConfig(config: RateLimitConfig): Promise<void>;
    getQueueStats(): Promise<any>;
}
//# sourceMappingURL=BroadcastService.d.ts.map