import * as oracledb from 'oracledb';
interface OutBindsEvent {
    event: string;
}
export interface DBResult {
    outBinds: OutBindsEvent;
}
export declare function readPoolConfigFromEnv(env: any): oracledb.PoolAttributes;
export declare function getConnection(config: oracledb.PoolAttributes): Promise<oracledb.Pool>;
export declare function testConnection(readyConnectionPool: oracledb.Pool): Promise<void>;
export declare function executeOnEvent<T>(readyConnectionPool: oracledb.Pool, onEvent: ((item: T) => boolean)): Promise<void>;
export {};
