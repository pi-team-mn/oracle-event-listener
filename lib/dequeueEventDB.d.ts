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
export declare function executeOnEvent<T>(readyConnectionPool: oracledb.Pool, query: string, databaseBind: string, onEvent: ((item: T) => boolean)): Promise<void>;
declare const _default: {
    executeOnEvent: typeof executeOnEvent;
    testConnection: typeof testConnection;
    readPoolConfigFromEnv: typeof readPoolConfigFromEnv;
    getConnection: typeof getConnection;
};
export default _default;
