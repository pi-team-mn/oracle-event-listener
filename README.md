# Oracle Event Listener

Execute function on Oracle DB events. Oracle AW is required to use this library!

## Example

```typescript
async function main() {
    // The :event in the query is important!
    const query = `begin
                                      :event := event_source_package.dequeue_event_function();
                                   end;`; 

    const oracleConfig = readPoolConfigFromEnv(process.env);
    const pool = await (getConnection(oracleConfig));
    await testConnection(pool);

    let nrConnections = 0;

    while (nrConnections < pool.poolMax) {
        executeOnEvent<IncomingEvent>(pool, query, async item => {
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
