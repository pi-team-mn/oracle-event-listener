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

const JSON_EVENT_MAX_SIZE = 32767;

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
        };
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
 * execute `onEvent` when an Oracle AWS event is triggered according to `query`.
 * On success, the result will be committed. On an exception, the transaction will be rolled back.
 *
 * @param readyConnectionPool A connection pool to an oracle DB.
 * @param query A PL/SQL block that looks for events. Max payload is 32KB.
 * @param databaseBind Binding for the event queue.
 * @param onEvent Function to execute on a new event.
 */
export async function executeOnEvent<T>(readyConnectionPool: oracledb.Pool, query: string,
                                        onEvent: ((item: T) => Promise<void>)) {
    const readyConnection = await (readyConnectionPool.getConnection());

    try {
        // @ts-ignore <- result HAS TO be an event, otherwise error!
        const result: DBResult = await readyConnection.execute(query, {
            event: {dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: JSON_EVENT_MAX_SIZE}
        });

        const item: T = JSON.parse(result.outBinds.event);

        await onEvent(item);
        await readyConnection.commit();
    } catch (e) {
        console.error(e);
        throw new Error(`Error at dequeue event: ${e}`);
    } finally {
        await readyConnection.close();
    }
}
