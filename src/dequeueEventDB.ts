import * as oracledb from 'oracledb';

interface OutBindsEvent {
    event: string
}

export interface DBResult {
    outBinds: OutBindsEvent
}

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

export async function getConnection(config: oracledb.PoolAttributes) {
    return await oracledb.createPool(config);
}

export async function testConnection(readyConnectionPool: oracledb.Pool) {
    const readyConnection = await readyConnectionPool.getConnection();
    await readyConnection.close();
    console.log('Database is accepting our connections');
}

export async function executeOnEvent<T>(readyConnectionPool: oracledb.Pool, onEvent: ((item: T) => boolean)) {
    const readyConnection = await (readyConnectionPool.getConnection());
    const query = `begin
                    :event := appl_relatie.persoon_mutaties_event_store.await_persoon_event(:subscriber);
                 end;`;
    const dbBind = 'CODA';

    try {
        const result: DBResult = await readyConnection.execute(query, {
            subscriber: {dir: oracledb.BIND_IN, type: oracledb.STRING, val: dbBind},
            event: {dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 32767}
        });

        const item: T = JSON.parse(result.outBinds.event);

        onEvent(item);

        await readyConnection.commit();
    } catch (e) {
        console.error(e);
        throw new Error(`Error at dequeue event: ${e}`);
    } finally {
        await readyConnection.close();
    }
}
