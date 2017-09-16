const expect = require('chai').expect;
const LogRecord = require('../src/LogRecord');
const levels = require('../src/levels');


describe('LogRecord', function () {
    let record;
    const err = new Error('baz');
    const extra = {
        bar: 'qux'
    };

    beforeEach(function () {
        record = new LogRecord(
            'testlogger',
            levels.INFO,
            '/some/file/path',
            'testFunc',
            31,
            'a message "%s"',
            ['foo'],
            err,
            extra
        );
    });

    it('has the right shape', function () {
        expect(record.name).to.equal('testlogger');
        expect(record.level).to.equal(levels.INFO);
        expect(record.levelName).to.equal(levels.LEVEL_NAMES[levels.INFO]);
        expect(record.pathname).to.equal('/some/file/path');
        expect(record.func).to.equal('testFunc');
        expect(record.lineno).to.equal(31);
        expect(record.msg).to.equal('a message "%s"');
        expect(record.args).to.deep.equal(['foo']);
        expect(record.process).to.equal(process.pid);
        expect(record.processName).to.equal(process.title);
        expect(record.created).to.be.an.instanceof(Date);
        expect(record.extra).to.deep.equal({bar: 'qux'});
    });

    it('formats args into msg', function () {
        expect(record.message).to.equal('a message "foo"');
    });

    describe('#getMessage', function () {
        it('formats args into msg', function () {
            expect(record.getMessage()).to.equal('a message "foo"');
        });
    });
});
