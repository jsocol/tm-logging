const expect = require('chai').expect;
const sinon = require('sinon');
const levels = require('../lib/levels');
const Logger = require('../lib/Logger');

function mockHandler () {
    return {
        handle: sinon.spy()
    };
}

describe('Logger', function () {
    it('should handle output', function () {
        const l = new Logger();
        const h = mockHandler();
        l.addHandler(h);
        l.debug('hi');
        expect(h.handle.callCount).to.equal(1);
        const arg = h.handle.firstCall.args[0];
        expect(arg.msg).to.equal('hi');
        expect(arg.level).to.equal(levels.DEBUG);
    });

    it('should allow multiple handlers', function () {
        const l = new Logger();
        const h = mockHandler();
        const g = mockHandler();
        l.addHandler(h);
        l.addHandler(g);
        l.info('hi');
        expect(h.handle.callCount).to.equal(1);
        expect(g.handle.callCount).to.equal(1);
        const hArg = h.handle.firstCall.args[0];
        const gArg = g.handle.firstCall.args[0];
        expect(gArg.msg).to.equal('hi');
        expect(gArg.level).to.equal(levels.INFO);
        expect(hArg.msg).to.equal('hi');
        expect(hArg.level).to.equal(levels.INFO);
    });

    it('should propagate to parent handlers', function () {
        const par = new Logger('parent');
        const ph = mockHandler();
        par.addHandler(ph);
        const child = new Logger('parent.child', null, par);
        const ch = mockHandler();
        child.addHandler(ch);
        child.warning('oh no');
        expect(ph.handle.callCount).to.equal(1);
        expect(ch.handle.callCount).to.equal(1);
        const pArg = ph.handle.firstCall.args[0];
        const cArg = ch.handle.firstCall.args[0];
        expect(pArg.name).to.equal('parent.child');
        expect(cArg.name).to.equal('parent.child');
    });

    it('should skip handling below-level records', function () {
        const l = new Logger('foo', levels.WARNING);
        const h = mockHandler();
        l.addHandler(h);

        l.debug('foo');
        expect(h.handle.callCount).to.equal(0);
    });

    it('should handle at-level records', function () {
        const l = new Logger('foo', levels.WARNING);
        const h = mockHandler();
        l.addHandler(h);

        l.warning('foo');
        expect(h.handle.callCount).to.equal(1);
    });

    it('should propagate too-low records', function () {
        const par = new Logger('parent');
        const ph = mockHandler();
        par.addHandler(ph);
        const child = new Logger('parent.child', levels.ERROR, par);
        const ch = mockHandler();
        child.addHandler(ch);
        child.info('bar');
        expect(ph.handle.callCount).to.equal(1);
        expect(ch.handle.callCount).to.equal(0);
    });

    it('should fall back if context cannot be found', function () {
        const l = new Logger('foo');
        const h = mockHandler();
        l.addHandler(h);
        const exc = new Error();
        exc.stack = '';
        l.exception(exc, 'Foo');
        expect(h.handle.callCount).to.equal(1);

        const record = h.handle.firstCall.args[0];
        expect(record.func).to.equal('');
        expect(record.pathname).to.equal('');
        expect(record.lineno).to.equal('');
    });

    it('should ignore unparseable frames', function () {
        const l = new Logger('foo');
        const h = mockHandler();
        l.addHandler(h);
        const exc = new Error();
        exc.stack = 'nothinghere\norhere\n' + exc.stack;
        l.exception(exc, 'Foo');
        expect(h.handle.callCount).to.equal(1);

        const record = h.handle.firstCall.args[0];
    });

    it('should have a debug method', function () {
        const l = new Logger('foo');
        const h = mockHandler();
        l.addHandler(h);

        l.debug('must die');
        expect(h.handle.callCount).to.equal(1);

        const record = h.handle.firstCall.args[0];
        expect(record.level).to.equal(levels.DEBUG);
    });

    it('should have an info method', function () {
        const l = new Logger('foo');
        const h = mockHandler();
        l.addHandler(h);

        l.info('must die');
        expect(h.handle.callCount).to.equal(1);

        const record = h.handle.firstCall.args[0];
        expect(record.level).to.equal(levels.INFO);
    });

    it('should have an warn/warning method', function () {
        const l = new Logger('foo');
        const h = mockHandler();
        l.addHandler(h);

        l.warn('must die');
        l.warning('will die');
        expect(h.handle.callCount).to.equal(2);

        const record1 = h.handle.firstCall.args[0];
        expect(record1.level).to.equal(levels.WARNING);

        const record2 = h.handle.secondCall.args[0];
        expect(record2.level).to.equal(levels.WARNING);
    });

    it('should have an error method', function () {
        const l = new Logger('foo');
        const h = mockHandler();
        l.addHandler(h);

        l.error('must die');
        expect(h.handle.callCount).to.equal(1);

        const record = h.handle.firstCall.args[0];
        expect(record.level).to.equal(levels.ERROR);
    });

    it('should have an exception method', function () {
        const l = new Logger('foo');
        const h = mockHandler();
        l.addHandler(h);
        const exc = new Error();

        l.exception(exc, 'must die');
        expect(h.handle.callCount).to.equal(1);

        const record = h.handle.firstCall.args[0];
        expect(record.level).to.equal(levels.ERROR);
        expect(record.exc).to.equal(exc);
    });

    it('should exit on fatal error', function () {
        const stub = sinon.stub(process, 'exit');

        const l = new Logger('foo');
        const h = mockHandler();
        l.addHandler(h);

        l.fatal('must die');
        expect(h.handle.callCount).to.equal(1);
        expect(stub.callCount).to.equal(1);

        const record = h.handle.firstCall.args[0];
        expect(record.level).to.equal(levels.ERROR);
        stub.restore();
    });

    it('should have a log method', function () {
        const l = new Logger('foo', levels.WARNING);
        const h = mockHandler();
        l.addHandler(h);

        l.log(levels.WARN, 'foo');
        expect(h.handle.callCount).to.equal(1);

        const record = h.handle.firstCall.args[0];
        expect(record.level).to.equal(levels.WARN);
    });
});
