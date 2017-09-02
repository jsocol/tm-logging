const expect = require('chai').expect;
const sinon = require('sinon');
const levels = require('../src/levels');
const Logger = require('../src/Logger');


function mockHandler () {
    return {
        handle: sinon.spy(),
    };
}


describe('Logger', function () {
    let handler;
    let logger;

    beforeEach(function () {
        handler = {
            handle: sinon.stub()
        };
        logger = new Logger();
    });

    it('has a name', function () {
        expect(logger.name).to.equal('root');
    });

    it('takes a name argument', function () {
        const logger = new Logger('foo');
        expect(logger.name).to.equal('foo');
    });

    it('has a level', function () {
        expect(logger.level).to.equal(levels.NOTSET);
    });

    it('takes a level argument', function () {
        const logger = new Logger('foo', levels.WARN);
        expect(logger.level).to.equal(levels.WARN);
    });

    it('has no parent by default', function () {
        expect(logger.parent).to.be.null;
    });

    it('takes a parent argument', function () {
        const child = new Logger('foo', levels.INFO, logger);
        expect(child.parent).to.equal(logger);
    });

    it('is set to propagate by default', function () {
        expect(logger.propagate).to.be.true;
    });

    it('can disable propagation', function () {
        const logger = new Logger('foo', levels.INFO, null, false);
        expect(logger.propagate).to.be.false;
    });

    it('has no handlers by default', function () {
        expect(logger.handlers).to.be.an.instanceof(Array);
        expect(logger.handlers).to.deep.equal([]);
    });

    describe('#setLevel', function () {
        it('sets the level', function () {
            logger.setLevel(levels.WARN);
            expect(logger.level).to.equal(levels.WARN);
        });

        it('defaults to NOTSET with invalid levels', function () {
            const logger = new Logger('foo', levels.INFO);
            logger.setLevel(-9);
            expect(logger.level).to.equal(levels.NOTSET);
        });

        it('defaults to NOTSET with no level', function () {
            const logger = new Logger('foo', levels.INFO);
            logger.setLevel();
            expect(logger.level).to.equal(levels.NOTSET);
        });
    });

    describe('#isEnabledFor', function () {
        it('is enabled for the current level', function () {
            logger.setLevel(levels.INFO);
            expect(logger.isEnabledFor(levels.INFO)).to.be.true;
        });

        it('is enabled for higher levels', function () {
            logger.setLevel(levels.DEBUG);
            expect(logger.isEnabledFor(levels.WARN)).to.be.true;
        });

        it('is disabled for lower levels', function () {
            logger.setLevel(levels.ERROR);
            expect(logger.isEnabledFor(levels.INFO)).to.be.false;
        });
    });

    describe('#addHandler', function () {
        it('adds a handler', function () {
            logger.addHandler(handler);
            expect(logger.handlers).to.have.lengthOf(1);
            expect(logger.handlers[0]).to.equal(handler);
        });

        it('does not add the same handler twice', function () {
            logger.addHandler(handler);
            logger.addHandler(handler);
            expect(logger.handlers).to.have.lengthOf(1);
        });

        it('adds distinct handlers', function () {
            const newHandler = {};
            logger.addHandler(handler);
            logger.addHandler(newHandler);
            expect(logger.handlers).to.have.lengthOf(2);
            expect(logger.handlers[1]).to.equal(newHandler);
        });
    });

    describe('#removeHandler', function () {
        beforeEach(function () {
            logger.addHandler(handler);
        });

        it('removes a handler', function () {
            logger.removeHandler(handler);
            expect(logger.handlers).to.have.lengthOf(0);
        });

        it('does not remove unadded handlers', function () {
            const newHandler = {};
            logger.removeHandler(newHandler);
            expect(logger.handlers).to.have.lengthOf(1);
            expect(logger.handlers[0]).to.equal(handler);
        });

        it('does not remove other handlers', function () {
            const newHandler = {};
            logger.addHandler(newHandler);
            expect(logger.handlers).to.have.lengthOf(2);
            logger.removeHandler(newHandler);
            expect(logger.handlers).to.have.lengthOf(1);
            expect(logger.handlers[0]).to.equal(handler);
        });
    });

    describe('log methods', function () {
        beforeEach(function () {
            logger.addHandler(handler);
        });

        ['debug', 'info', 'warn', 'warning', 'error', 'fatal'].forEach(function (method) {
            describe('#' + method, function () {
                let levelName;

                before(function () {
                    levelName = method.toUpperCase();
                });

                it('creates a LogRecord with level ' + method.toUpperCase(), function () {
                    logger[method]('hi there');
                    sinon.assert.calledOnce(handler.handle);
                    const record = handler.handle.firstCall.args[0];
                    const level = levels[levelName];
                    expect(record.level).to.equal(level);
                    expect(record.levelName).to.equal(levels.getLevelName(level));
                });

                it('formats in additional arguments', function () {
                    logger[method]('hi %s', 'friend');
                    sinon.assert.calledOnce(handler.handle);
                    const record = handler.handle.firstCall.args[0];
                    expect(record.message).to.equal('hi friend');
                });

                it('includes callsite context', function namedTest() {
                    logger[method]('hi');
                    sinon.assert.calledOnce(handler.handle);
                    const record = handler.handle.firstCall.args[0];
                    expect(record.lineno).to.equal('181');
                    expect(record.pathname).to.equal(__filename);
                    expect(record.func).to.equal('Context.namedTest');
                });
            });
        });

        describe('#exception', function () {
            it('accepts an exception parameter', function () {
                const err = new Error('waddup');
                logger.exception(err, 'oh no');
                sinon.assert.calledOnce(handler.handle);
                const record = handler.handle.firstCall.args[0];
                expect(record.exc).to.equal(err);
                expect(record.message).to.equal('oh no');
            });

            it('creates a LogRecord with level ERROR', function () {
                const err = new Error('waddup');
                logger.exception(err, 'oh no');
                sinon.assert.calledOnce(handler.handle);
                const record = handler.handle.firstCall.args[0];
                expect(record.level).to.equal(levels.ERROR);
            });

            it('formats in additional arguments', function () {
                const err = new Error('waddup');
                logger.exception(err, 'hi %s', 'friend');
                sinon.assert.calledOnce(handler.handle);
                const record = handler.handle.firstCall.args[0];
                expect(record.message).to.equal('hi friend');
            });
        });

        describe('#log', function () {
            it('takes a level argument', function () {
                logger.log(levels.WARN, 'uh oh');
                sinon.assert.calledOnce(handler.handle);
                const record = handler.handle.firstCall.args[0];
                expect(record.level).to.equal(levels.WARN);
                expect(record.message).to.equal('uh oh');
            });

            it('formats in additional arguments', function () {
                logger.exception(levels.INFO, 'hi %s', 'friend');
                sinon.assert.calledOnce(handler.handle);
                const record = handler.handle.firstCall.args[0];
                expect(record.message).to.equal('hi friend');
            });
        });
    });

    describe('#handle', function () {
        it('calls handle on multiple handlers', function () {
            const handler2 = mockHandler();
            logger.addHandler(handler);
            logger.addHandler(handler2);
            logger.info('hi');
            sinon.assert.calledOnce(handler.handle);
            sinon.assert.calledOnce(handler2.handle);
            const record = handler.handle.firstCall.args[0];
            const record2 = handler2.handle.firstCall.args[0];
            expect(record.msg).to.equal('hi');
            expect(record.level).to.equal(levels.INFO);
            expect(record2.msg).to.equal('hi');
            expect(record2.level).to.equal(levels.INFO);
        });

        it('propagates to parent handlers', function () {
            const par = new Logger('parent');
            const ph = mockHandler();
            par.addHandler(ph);
            const child = new Logger('parent.child', null, par);
            const ch = mockHandler();
            child.addHandler(ch);
            child.warning('oh no');
            sinon.assert.calledOnce(ph.handle);
            sinon.assert.calledOnce(ch.handle);
            const pArg = ph.handle.firstCall.args[0];
            const cArg = ch.handle.firstCall.args[0];
            expect(pArg.name).to.equal('parent.child');
            expect(cArg.name).to.equal('parent.child');
        });

        it('skips handling below-level records', function () {
            const logger = new Logger('foo', levels.WARNING);
            logger.addHandler(handler);

            logger.debug('foo');
            sinon.assert.notCalled(handler.handle);
        });

        it('handles at-level records', function () {
            const logger = new Logger('foo', levels.WARNING);
            logger.addHandler(handler);

            logger.warning('foo');
            sinon.assert.calledOnce(handler.handle);
        });

        it('propagates too-low records', function () {
            const par = new Logger('parent');
            const ph = mockHandler();
            par.addHandler(ph);
            const child = new Logger('parent.child', levels.ERROR, par);
            const ch = mockHandler();
            child.addHandler(ch);
            child.info('bar');
            sinon.assert.calledOnce(ph.handle);
            sinon.assert.notCalled(ch.handle);
        });
    });

    describe('#_getContext', function () {
        let err;

        before(function namedBefore() {
            err = new Error('whoa');
        });

        it('gets the current callsite context', function () {
            const context = logger._getContext();
            expect(context.pathname).to.equal(__filename);
            // the line number of the _getContext call in this test
            expect(context.lno).to.equal('305');
            // the column number of the _getContext call (after the logger.)
            expect(context.col).to.equal('36');
            // this is an anonymous test function
            expect(context.func).to.equal('Context.<anonymous>');
        });

        it('gets function names for callers', function namedTest() {
            const context = logger._getContext();
            expect(context.func).to.equal('Context.namedTest');
        });

        it('extracts context from a passed exception', function () {
            const context = logger._getContext(err);
            expect(context.lno).to.equal('301');
            expect(context.col).to.equal('19');
            expect(context.func).to.equal('Context.namedBefore');
        });

        it('falls back if context cannot be found', function () {
            const exc = new Error();
            exc.stack = '';
            const context = logger._getContext(exc);
            expect(context.func).to.equal('');
            expect(context.pathname).to.equal('');
            expect(context.lno).to.equal('');
            expect(context.col).to.equal('');
        });

        it('should ignore unparseable frames', function () {
            const exc = new Error();
            exc.stack = 'nothinghere\norhere\n' + exc.stack;
            expect(logger._getContext, exc).not.to.throw;
        });
    });
});
