const expect = require('chai').expect;
const formatters = require('../src/formatters');
const levels = require('../src/levels');
const LogRecord = require('../src/LogRecord');

describe('format helper', function () {
    it('should replace named strings', function () {
        expect(formatters.format('hi %(name)s', {name: 'john'})).to.equal('hi john');
    });

    it('should replace several constiables', function () {
        const values = {
            name: 'john',
            foo: 'bar'
        };
        const result = formatters.format('hi %(name)s %(foo)s %(qux)s %(name)s', values);
        expect(result).to.equal('hi john bar undefined john');
    });
});

describe('dateFormat helper', function () {
    xit('should format datetimes', function () {
        const dt = new Date('2012-07-04T12:13:14-0600');
        const format = '%Y-%m-%dT%H:%M:%S %p %a %A %b %B %w %z %%';
        const result = formatters.dateFormat(format, dt);
        expect(result).to.equal('2012-07-04T14:13:14 PM Wed Wednesday Jul July 3 0400 %');
    });
});

function makeLogRecord (name) {
    return new LogRecord(name || 'root', levels.INFO, 'foo', 'bar', 12, 'msg goes here', [], null);
}

describe('Formatter', function () {
    it('should return a formatted message by default', function () {
        const f = new formatters.Formatter();
        expect(f.format(makeLogRecord())).to.equal('msg goes here');
    });

    xit('should follow a format', function () {
        const f = new formatters.Formatter('%(asctime)s [%(levelName)s] %(pathname)s:%(lineno)s [%(process)s] %(message)s');
        const record = makeLogRecord();
        record.created = new Date('2012-11-10T09:08:07Z');
        record.process = 401;
        expect(f.format(record)).to.equal('2012-11-10T04:08:07 [INFO] foo:12 [401] msg goes here');
    });

    it('should respect datefmt', function () {
        const f = new formatters.Formatter('%(asctime)s %(message)s', '%a, %b %d, %Y');
        const record = makeLogRecord();
        record.created = new Date('2013-12-11T10:09:08Z');
        expect(f.format(record)).to.equal('Wed, Dec 11, 2013 msg goes here');
    });

    it('should include logger name', function () {
        const f = new formatters.Formatter('%(name)s');
        const record = makeLogRecord('test');
        expect(f.format(record)).to.equal('test');
    });

    it('should format in args', function () {
        const f = new formatters.Formatter();
        const record = makeLogRecord();
        record.args = ['a', 1, 2, {b: 3}];
        record.msg = '%s %s %s %j';
        expect(f.format(record)).to.equal('a 1 2 {"b":3}');
    });

    it('should append stack trace info', function() {
        const f = new formatters.Formatter();
        const record = makeLogRecord();
        const exc = new Error();
        exc.stack = 'a stack';
        record.exc = exc;
        record.msg = 'a message';
        expect(f.format(record)).to.equal('a message\na stack');
    });
});
