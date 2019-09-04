"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const oracledb = require("oracledb");
/**
 * Check an object and see if it has the proper parameters for Oracle configs.
 * @param env An object that contains keys.
 * @returns A configured PoolAttributes object.
 */
function readPoolConfigFromEnv(env) {
    const oracleConnectionString = env.ORACLE_CONNECTION_STRING;
    const oracleUser = env.ORACLE_USER;
    const oraclePassword = env.ORACLE_PASSWORD;
    if ([oracleConnectionString, oracleUser, oraclePassword].some(it => !it)) {
        throw new Error(`You are missing environment variables!`);
    }
    else {
        return {
            connectionString: process.env.ORACLE_CONNECTION_STRING,
            user: process.env.ORACLE_USER,
            password: process.env.ORACLE_PASSWORD
        };
    }
}
exports.readPoolConfigFromEnv = readPoolConfigFromEnv;
/**
 * Takes PoolAttributes and turns it into a connection pool.
 * @param config PoolAttributes that connect to a database.
 * @returns A connection pool to an oracle DB.
 */
async function getConnection(config) {
    return await oracledb.createPool(config);
}
exports.getConnection = getConnection;
/**
 * Verify that the pool is connected properly by opening a connection.
 * @param readyConnectionPool An instantiated connection pool to test.
 * @throws Error When a connection to the DB cannot be established
 */
async function testConnection(readyConnectionPool) {
    const readyConnection = await readyConnectionPool.getConnection();
    await readyConnection.close();
    console.log('Database is accepting our connections');
}
exports.testConnection = testConnection;
/**
 * execute `onEvent` when an event is triggered according to `query`.
 * @param readyConnectionPool A connection pool to an oracle DB.
 * @param query An SQL query that returns an event.
 * @param databaseBind Binding for the event queue.
 * @param onEvent Function to execute on a new event.
 */
async function executeOnEvent(readyConnectionPool, query, databaseBind, onEvent) {
    const readyConnection = await (readyConnectionPool.getConnection());
    try {
        const result = await readyConnection.execute(query, {
            subscriber: { dir: oracledb.BIND_IN, type: oracledb.STRING, val: databaseBind },
            event: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 32767 }
        });
        const item = JSON.parse(result.outBinds.event);
        let success = await onEvent(item);
        console.log('success: ', success);
        await readyConnection.commit();
    }
    catch (e) {
        console.error(e);
        throw new Error(`Error at dequeue event: ${e}`);
    }
    finally {
        await readyConnection.close();
    }
}
exports.executeOnEvent = executeOnEvent;
//# sourceMappingURL=dequeueEventDB.js.map