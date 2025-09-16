declare class DatabaseConnection {
    private static instance;
    private isConnected;
    private constructor();
    static getInstance(): DatabaseConnection;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    getConnectionStatus(): boolean;
}
export declare const databaseConnection: DatabaseConnection;
export {};
//# sourceMappingURL=connection.d.ts.map