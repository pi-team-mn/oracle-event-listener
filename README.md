# Oracle Event Listener

Execute function on Oracle DB events.

## Example

```typescript
async function main() {
    const query = `Fill Me`;
    const databaseBind = 'Binding Agent';

    const oracleConfig = readPoolConfigFromEnv(process.env);
    const pool = await (getConnection(oracleConfig));
    await testConnection(pool);

    let nrConnections = 0;

    while (nrConnections < pool.poolMax) {
        executeOnEvent<IncomingEvent>(pool, query, databaseBind, async item => {
            return await sendToCoda(transform(item));
        }).catch((err: any) => console.error(err));
        nrConnections++;
        console.log(`Awaiting events ... (coroutine ${nrConnections})`);
    }
}

main().catch(err => console.error(err))
```

## Environment variables

name | required | notes
--- | --- | ---
ORACLE_CONNECTION_STRING | yes | connection string for the database
ORACLE_USER | yes | user to connect to db with
ORACLE_PASSWORD | yes | password for the user 
