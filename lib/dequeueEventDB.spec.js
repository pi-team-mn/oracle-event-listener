"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dequeueEventDB = require("./dequeueEventDB");
const dequeueEventDB_1 = require("./dequeueEventDB");
const chai_1 = require("chai");
const sinonChai = require("sinon-chai");
const sinon = require("sinon");
chai_1.use(sinonChai);
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
            chai_1.expect(dequeueEventDB.readPoolConfigFromEnv({
                ORACLE_CONNECTION_STRING: "test",
                ORACLE_USER: "test",
                ORACLE_PASSWORD: "test"
            })).to.exist;
        });
        it('throws an error when configs are missing', () => {
            chai_1.expect(dequeueEventDB.readPoolConfigFromEnv).to.throw(Error);
        });
    });
    describe('#testConnection', () => {
        it('works when the connection completes', async () => {
            const connectionStub = {
                close: sinon.spy()
            };
            const poolStub = {
                getConnection: sinon.stub().returns(connectionStub),
            };
            await dequeueEventDB_1.testConnection(poolStub);
            chai_1.expect(poolStub.getConnection).to.have.been.called;
        });
    });
    describe('#executeOnEvent', async () => {
        it('executes the functor on a successful fetch', async () => {
            const queryResult = {
                outBinds: {
                    event: '{}'
                }
            };
            const connectionStub = {
                execute: sinon.stub().returns(queryResult),
                commit: sinon.stub().resolves(),
                close: sinon.stub().resolves()
            };
            const poolStub = {
                getConnection: sinon.stub().resolves(connectionStub),
            };
            await dequeueEventDB_1.executeOnEvent(poolStub, '', '', item => item);
            chai_1.expect(connectionStub.close).to.be.have.been.called;
        });
        it('closes the connection when an error occurs', async () => {
            const connectionStub = {
                execute: sinon.stub().throws(Error),
                commit: sinon.stub().resolves(),
                close: sinon.stub().resolves()
            };
            const poolStub = {
                getConnection: sinon.stub().resolves(connectionStub)
            };
            try {
                await dequeueEventDB_1.executeOnEvent(poolStub, '', '', item => item);
            }
            catch (e) {
            }
            finally {
                // nothing
            }
            chai_1.expect(connectionStub.commit).to.not.have.been.called;
            chai_1.expect(connectionStub.close).to.have.been.called;
        });
    });
});
//# sourceMappingURL=dequeueEventDB.spec.js.map