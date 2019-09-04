import * as oracledb from 'oracledb';

interface OutBindsEvent {
    event: string
}

/**
 * Exported for testing, do not use!
 */
export interface DBResult {
    outBinds: OutBindsEvent
}

/**
 * Check an object and see if it has the proper parameters for Oracle configs.
 * @param env An object that contains keys.
 * @returns A configured PoolAttributes object.
 */
export function readPoolConfigFromEnv(env: any): oracledb.PoolAttributes {
    const oracleConnectionString = env.ORACLE_CONNECTION_STRING;
    const oracleUser = env.ORACLE_USER;
    const oraclePassword = env.ORACLE_PASSWORD;

    if ([oracleConnectionString, oracleUser, oraclePassword].some(it => !it)) {
        throw new Error(`You are missing environment variables!`);
    } else {
        return {
            connectionString: process.env.ORACLE_CONNECTION_STRING,
            user: process.env.ORACLE_USER,
            password: process.env.ORACLE_PASSWORD
        }
    }
}

/**
 * Takes PoolAttributes and turns it into a connection pool.
 * @param config PoolAttributes that connect to a database.
 * @returns A connection pool to an oracle DB.
 */
export async function getConnection(config: oracledb.PoolAttributes) {
    return await oracledb.createPool(config);
}

/**
 * Verify that the pool is connected properly by opening a connection.
 * @param readyConnectionPool An instantiated connection pool to test.
 * @throws Error When a connection to the DB cannot be established
 */
export async function testConnection(readyConnectionPool: oracledb.Pool) {
    const readyConnection = await readyConnectionPool.getConnection();
    await readyConnection.close();
    console.log('Database is accepting our connections');
}

/**
 * execute `onEvent` when an event is triggered according to `query`.
 * @param readyConnectionPool A connection pool to an oracle DB.
 * @param query An SQL query that returns an event.
 * @param databaseBind Binding for the event queue.
 * @param onEvent Function to execute on a new event.
 */
export async function executeOnEvent<T>(readyConnectionPool: oracledb.Pool, query: string, databaseBind: string, onEvent: ((item: T) => Promise)) {
    const readyConnection = await (readyConnectionPool.getConnection());

    try {
        const result: DBResult = await readyConnection.execute(query, {
            subscriber: {dir: oracledb.BIND_IN, type: oracledb.STRING, val: databaseBind},
            event: {dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 32767}
        });

        const item: T = JSON.parse(result.outBinds.event);

        let success = await onEvent(item);

        console.log('success: ', success);

        await readyConnection.commit();
    } catch (e) {
        console.error(e);
        throw new Error(`Error at dequeue event: ${e}`);
    } finally {
        await readyConnection.close();
    }
}
