"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const oracledb = require("oracledb");
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
async function getConnection(config) {
    return await oracledb.createPool(config);
}
exports.getConnection = getConnection;
async function testConnection(readyConnectionPool) {
    const readyConnection = await readyConnectionPool.getConnection();
    await readyConnection.close();
    console.log('Database is accepting our connections');
}
exports.testConnection = testConnection;
async function executeOnEvent(readyConnectionPool, onEvent) {
    const readyConnection = await (readyConnectionPool.getConnection());
    const query = `begin
                    :event := appl_relatie.persoon_mutaties_event_store.await_persoon_event(:subscriber);
                 end;`;
    const dbBind = 'CODA';
    try {
        const result = await readyConnection.execute(query, {
            subscriber: { dir: oracledb.BIND_IN, type: oracledb.STRING, val: dbBind },
            event: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 32767 }
        });
        const item = JSON.parse(result.outBinds.event);
        onEvent(item);
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