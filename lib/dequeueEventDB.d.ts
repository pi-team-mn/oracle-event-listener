import * as oracledb from 'oracledb';
interface OutBindsEvent {
    event: string;
}
/**
 * Exported for testing, do not use!
 */
export interface DBResult {
    outBinds: OutBindsEvent;
}
/**
 * Check an object and see if it has the proper parameters for Oracle configs.
 * @param env An object that contains keys.
 * @returns A configured PoolAttributes object.
 */
export declare function readPoolConfigFromEnv(env: any): oracledb.PoolAttributes;
/**
 * Takes PoolAttributes and turns it into a connection pool.
 * @param config PoolAttributes that connect to a database.
 * @returns A connection pool to an oracle DB.
 */
export declare function getConnection(config: oracledb.PoolAttributes): Promise<oracledb.Pool>;
/**
 * Verify that the pool is connected properly by opening a connection.
 * @param readyConnectionPool An instantiated connection pool to test.
 */
export declare function testConnection(readyConnectionPool: oracledb.Pool): Promise<void>;
/**
 * execute `onEvent` when an event is triggered according to `query`.
 * @param readyConnectionPool A connection pool to an oracle DB.
 * @param query An SQL query that returns an event.
 * @param databaseBind Binding for the event queue.
 * @param onEvent Function to execute on a new event.
 */
export declare function executeOnEvent<T>(readyConnectionPool: oracledb.Pool, query: string, databaseBind: string, onEvent: ((item: T) => Promise<boolean>)): Promise<void>;
export {};
