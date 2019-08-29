# Oracle Event Listener

Execute function on Oracle DB events.

## Example

```typescript
import { executeOnEvent, getConnection, readPoolConfigFromEnv, testConnection } from '@pi-team-mn/oracle-event-listener/lib/dequeueEventDB';

async function main() {
    const oracleConfig = readPoolConfigFromEnv(process.env);
    const pool = await (getConnection(oracleConfig));
    await testConnection(pool);

    let nrConnections = 0;

    while (nrConnections < pool.poolMax) {
        executeOnEvent<EventType>(pool, (item => {
            console.log(item);
            return true;
        })).catch(err => console.error(err));
        nrConnections++;
        console.log(`Awaiting events ... (coroutine ${nrConnections})`)
    }
}
```

## Environment variables

name | required | notes
--- | --- | ---
ORACLE_CONNECTION_STRING | yes | connection string for the database
ORACLE_USER | yes | user to connect to db with
ORACLE_PASSWORD | yes | password for the user 
