const chai = require('chai');
chai.should();
const sinon = require('sinon');
const sandbox = sinon.createSandbox();
// const TrelloRequest = require('./trelloRequest')
const rpn = require('request-promise-native');
const TrelloRequest = require('./TrelloRequest');
const fakeCreds = { key: '123', token: 'token' };
const trelloRequest = new TrelloRequest(fakeCreds);
const TEST_PATH = '/1/cards';
const EXPECTED_URI = `https://api.trello.com${TEST_PATH}`;
const { match } = sinon;
describe('TrelloRequest Unit Tests', () => {
    describe('get() should', () => {
        let getStub;
        before(async () => {
            getStub = sandbox.stub(rpn, 'get').resolves();
            await trelloRequest.get({ path: TEST_PATH, options: { limit: 10 } });
        });
        after(() => {
            sandbox.restore();
        });
        it('be passed the uri property', () => {
            getStub.calledWith(match.has('uri', EXPECTED_URI)).should.be.true;
        });
        it('be passed the auth object in the query string (qs) property', () => {
            getStub.calledWith(match.hasNested('qs.key', '123')).should.be.true;
        });
        it('be passed the limit object as part of the query string property', () => {
            getStub.calledWith(match.hasNested('qs.limit', 10)).should.be.true;
        });
        it('be passed the json property', () => {
            getStub.calledWith(match.has('json', true)).should.be.true;
        });
        it('be passed the resolveWithFullResponse property', () => {
            getStub.calledWith(match.has('resolveWithFullResponse', false)).should.be.true;
        });
    });
    describe('put() should', () => {
        let putStub;
        before(async () => {
            putStub = sandbox.stub(rpn, 'put').resolves();
            await trelloRequest.put({ path: TEST_PATH, body: { fields: 'name' } });
        });
        after(() => {
            sandbox.restore();
        });
        it('be passed the uri property', () => {
            putStub.calledWith(match.has('uri', EXPECTED_URI)).should.be.true;
        });
        it('have a body object', () => {
            putStub.calledWith(match.hasNested('body', { fields: 'name' })).should.be.true;
        });
    });
    describe('post() should', () => {
        let postStub;
        before(async () => {
            // @ts-ignore
            postStub = sandbox.stub(rpn, 'post').resolves();
            await trelloRequest.post({ path: TEST_PATH, body: { fields: 'name' } });
        });
        after(() => {
            sandbox.restore();
        });
        it('be passed the uri property', () => {
            postStub.calledWith(match.has('uri', EXPECTED_URI)).should.be.true;
        });
        it('have a body object', () => {
            postStub.calledWith(match.hasNested('body', { fields: 'name' })).should.be.true;
        });
    });
    describe('delete() should', () => {
        let deleteStub;
        before(async () => {
            // @ts-ignore
            deleteStub = sandbox.stub(rpn, 'delete').returns(Promise.resolve('delete done'));
            await trelloRequest.delete({ path: TEST_PATH, options: { fields: 'name' } });
        });
        after(() => {
            sandbox.restore();
        });
        it('be passed the uri property', () => {
            deleteStub.calledWith(match.has('uri', EXPECTED_URI)).should.be.true;
        });
        it('have an options object', () => {
            deleteStub.calledWith(match.hasNested('options', { fields: 'name' })).should.be.true;
        });
    });
});
