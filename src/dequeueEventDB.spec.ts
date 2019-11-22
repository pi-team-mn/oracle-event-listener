import { expect, use } from 'chai';
import * as oracledb from 'oracledb';
import { Connection, Pool } from 'oracledb';
import sinon = require('sinon');
import sinonChai from 'sinon-chai';
import * as dequeueEventDB from './dequeueEventDB';
import { DBResult, executeOnEvent, testConnection } from './dequeueEventDB';

use(sinonChai);

describe('dequeueEventDB', () => {
    describe('#readPoolConfigFromEnv', () => {
        beforeEach(() => {
            Object.keys(process.env).forEach(key => {
                if (key.startsWith('ORACLEDB_')) {
                    delete process.env[key];
                }
            });
        });

        it('returns a connection on data present', () => {
            expect(dequeueEventDB.readPoolConfigFromEnv({
                                                            ORACLE_CONNECTION_STRING: 'test',
                                                            ORACLE_USER: 'test',
                                                            ORACLE_PASSWORD: 'test'
                                                        })).to.exist;
        });

        it('throws an error when configs are missing', () => {
            expect(dequeueEventDB.readPoolConfigFromEnv).to.throw(Error);
        });
    });

    describe('#testConnection', () => {
        it('works when the connection completes', async() => {
            const connectionStub = {
                close: sinon.spy()
            };
            const poolStub = {
                getConnection: sinon.stub().returns(connectionStub)
            };

            await testConnection(poolStub as unknown as oracledb.Pool);

            expect(poolStub.getConnection).to.have.been.called;
        });
    });

    describe('#executeOnEvent', async() => {
        it('executes the functor on a successful fetch', async() => {
            const queryResult: DBResult = {
                outBinds: {
                    event: '{}'
                }
            };
            const connectionStub = {
                execute: sinon.stub().returns(queryResult),
                commit: sinon.stub().resolves(),
                close: sinon.stub().resolves()
            } as unknown as Connection;

            const poolStub = {
                getConnection: sinon.stub().resolves(connectionStub)
            } as unknown as Pool;

            await executeOnEvent<any>(poolStub, '', item => item);

            expect(connectionStub.close).to.be.have.been.called;
        });

        it('closes the connection when an error occurs', async() => {
            const connectionStub = {
                execute: sinon.stub().throws(Error),
                commit: sinon.stub().resolves(),
                close: sinon.stub().resolves()
            };
            const poolStub = {
                getConnection: sinon.stub().resolves(connectionStub)
            } as unknown as Pool;

            try {
                await executeOnEvent<any>(poolStub, '', _ => Promise.resolve());
                // tslint:disable-next-line:no-empty
            } catch (e) {

            } finally {
                // nothing
            }

            expect(connectionStub.commit).to.not.have.been.called;
            expect(connectionStub.close).to.have.been.called;
        });
    });
});
