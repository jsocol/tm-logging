const fs = require('fs');
const os = require('os');
const expect = require('chai').expect;
const sinon = require('sinon');
const formatters = require('../src/formatters');
const handlers = require('../src/handlers');
const levels = require('../src/levels');
const LogRecord = require('../src/LogRecord');


describe('Handler', function () {
    let handler;
    let record;

    beforeEach(function () {
        handler = new handlers.Handler();
        record = new LogRecord(
            'testlogger',
            levels.INFO,
            '/some/file/path',
            'testFunc',
            31,
            'a message "%s"',
            ['foo']
        );
    });

    it('defaults to NOTSET level', function () {
        expect(handler.level).to.equal(levels.NOTSET);
    });

    it('accepts a level argument', function () {
        const handler = new handlers.Handler(levels.INFO);
        expect(handler.level).to.equal(levels.INFO);
        handler.setLevel(levels.WARNING);
        expect(handler.level).to.equal(levels.WARNING);
    });

    it('has a default formatter', function () {
        expect(handler.formatter).to.be.an.instanceof(formatters.Formatter);
    });

    describe('#setFormatter', function () {
        it('sets a new formatter object', function () {
            const formatter = new formatters.Formatter();
            handler.setFormatter(formatter);
            expect(handler.formatter).to.equal(formatter);
        });
    });

    describe('#format', function () {
        it('calls formatter.format', function () {
            const formatter = {
                format: sinon.stub()
            };
            formatter.format.returns('hey hey hey');
            handler.setFormatter(formatter);
            const output = formatter.format(record);
            sinon.assert.calledOnce(formatter.format);
            sinon.assert.calledWithExactly(formatter.format, record);
            expect(output).to.equal('hey hey hey');
        });
    });

    describe('#setLevel', function () {
        it('sets the handler level', function () {
            handler.setLevel(levels.WARN);
            expect(handler.level).to.equal(levels.WARN);
        });

        it('falls back to NOTSET on invalid level', function () {
            const handler = new handlers.Handler(levels.WARN);
            handler.setLevel(-999);
            expect(handler.level).to.equal(levels.NOTSET);
        });

        it('falls back to NOTSET on no level', function () {
            const handler = new handlers.Handler(levels.WARN);
            handler.setLevel();
            expect(handler.level).to.equal(levels.NOTSET);
        });
    });

    describe('#handle', function () {
        it('emit when the record level is higher than the handler level', function () {
            handler.emit = sinon.spy();
            handler.setLevel(levels.INFO);
            handler.handle({level: levels.WARNING});
            sinon.assert.calledOnce(handler.emit);
        });

        it('should emit when the record level matches the handler level', function () {
            handler.emit = sinon.spy();
            handler.setLevel(levels.INFO);
            handler.handle({level: levels.INFO});
            sinon.assert.calledOnce(handler.emit);
        });

        it('should not emit when the record level is below the handler level', function () {
            handler.emit = sinon.spy();
            handler.setLevel(levels.ERROR);
            handler.handle({level: levels.INFO});
            sinon.assert.notCalled(handler.emit);
        });
    });

    describe('#isEnabledFor', function () {
        it('is enabled for the current level', function () {
            handler.setLevel(levels.INFO);
            expect(handler.isEnabledFor(levels.INFO)).to.be.true;
        });

        it('is enabled for higher levels', function () {
            handler.setLevel(levels.DEBUG);
            expect(handler.isEnabledFor(levels.WARN)).to.be.true;
        });

        it('is disabled for lower levels', function () {
            handler.setLevel(levels.ERROR);
            expect(handler.isEnabledFor(levels.INFO)).to.be.false;
        });
    });

    describe('#emit', function () {
        it('is not implemented', function () {
            expect(handler.emit, record).to.throw('Not Implemented');
        });
    });
});

describe('StreamHandler', function () {
    let handler;
    let stream;
    let record;

    beforeEach(function () {
        stream = {
            write: sinon.stub(),
            once: sinon.stub()
        };
        stream.write.returns(true);
        handler = new handlers.StreamHandler(levels.NOTSET, stream);
        record = new LogRecord(
            'testlogger',
            levels.INFO,
            '/some/file/path',
            'testFunc',
            31,
            'a message "%s"'
        );
    });

    it('is a handler', function () {
        expect(handler).to.be.an.instanceof(handlers.Handler);
    });

    it('defaults to using process.stderr and NOTSET level', function () {
        const handler = new handlers.StreamHandler();
        expect(handler.stream).to.equal(process.stderr);
        expect(handler.level).to.equal(levels.NOTSET);
    });

    it('accepts a stream argument', function () {
        const stream = {};
        const handler = new handlers.StreamHandler(levels.INFO, stream);
        expect(handler.stream).to.equal(stream);
    });

    it('accepts a stream argument without a level', function () {
        const stream = {};
        const handler = new handlers.StreamHandler(stream);
        expect(handler.stream).to.equal(stream);
        expect(handler.level).to.equal(levels.NOTSET);
    });

    describe('#emit', function () {
        it('calls formatter.format', function () {
            const formatter = {
                format: sinon.stub()
            };
            formatter.format.returns('hello dolly');
            handler.setFormatter(formatter);
            handler.emit(record);

            sinon.assert.calledOnce(formatter.format);
            sinon.assert.calledWithExactly(formatter.format, record);
            sinon.assert.calledOnce(stream.write);
            sinon.assert.calledWithExactly(stream.write, 'hello dolly\n');
        });

        it('should write to the stream', function () {
            handler.setFormatter(new formatters.Formatter());
            record.msg = 'hi there';
            handler.emit(record);
            sinon.assert.calledOnce(stream.write);
            sinon.assert.calledWithExactly(stream.write, 'hi there\n');
        });

        it('retries the write when the stream is draining', function () {
            handler.setFormatter(new formatters.Formatter());
            stream.write.returns(false);
            handler.emit(record);

            sinon.assert.calledOnce(stream.write);
            sinon.assert.calledWith(stream.write, record.message + '\n');
            sinon.assert.calledOnce(stream.once);
            sinon.assert.calledWith(stream.once, 'drain');

            const callback = stream.once.firstCall.args[1];
            stream.write.returns(true);
            callback();
            sinon.assert.calledTwice(stream.write);
        });
    });
});

describe('FileHandler', function () {
    let handler;
    let tmpfile;

    before(function () {
        tmpfile = os.tmpdir() + '/logfile';
    });

    beforeEach(function () {
        handler = new handlers.FileHandler(levels.LEVEL, tmpfile);
    });

    after(function () {
        fs.unlinkSync(tmpfile);
    });

    it('it a StreamHandler', function () {
        expect(handler).to.be.an.instanceof(handlers.StreamHandler);
    });

    it('accepts a path argument', function () {
        expect(handler.path).to.equal(tmpfile);
    });

    it('accepts a path argument without a level', function () {
        const handler = new handlers.FileHandler(tmpfile);
        expect(handler.path).to.equal(tmpfile);
        expect(handler.level).to.equal(levels.NOTSET);
    });

    it('creates a writable stream', function () {
        expect(handler.stream).to.be.an.instanceof(fs.WriteStream);
        expect(handler.stream.writable).to.be.true;
    });

    xdescribe('#reopen', function () {
    });
});
