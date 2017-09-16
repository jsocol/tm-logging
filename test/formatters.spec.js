const expect = require('chai').expect;
const sinon = require('sinon');
const formatters = require('../src/formatters');
const levels = require('../src/levels');
const LogRecord = require('../src/LogRecord');


describe('format helper', function () {
    it('should replace named strings', function () {
        expect(formatters.format('hi %(name)s', {name: 'john'})).to.equal('hi john');
    });

    it('should replace several variables', function () {
        const values = {
            name: 'john',
            foo: 'bar'
        };
        const result = formatters.format('hi %(name)s %(foo)s %(qux)s %(name)s', values);
        expect(result).to.equal('hi john bar undefined john');
    });
});


describe('dateFormat helper', function () {
    let clock;

    before(function () {
        clock = sinon.useFakeTimers();
    });

    after(function () {
        clock.restore();
    });

    it('should format datetimes', function () {
        const dt = new Date('2012-07-04T12:13:14-0600');
        const format = '%Y-%m-%dT%H:%M:%S %p %a %A %b %B %w %z %%';
        const result = formatters.dateFormat(format, dt);
        expect(result).to.equal('2012-07-04T14:13:14 PM Wed Wednesday Jul July 3 0400 %');
    });
});


describe('Formatter', function () {
    let record;

    beforeEach(function () {
        record = new LogRecord(
            'root',
            levels.INFO,
            '/some/path',
            'someFunc',
            12,
            'msg goes here %s',
            ['foo'],
            null
        );
    });

    it('should return a formatted message by default', function () {
        const f = new formatters.Formatter();
        expect(f.format(record)).to.equal('msg goes here foo');
    });

    it('should follow a format', function () {
        const f = new formatters.Formatter('[%(levelName)s] %(pathname)s:%(lineno)s [%(process)s] %(message)s');
        record.created = new Date('2012-11-10T09:08:07Z');
        record.process = 401;
        expect(f.format(record)).to.equal('[INFO] /some/path:12 [401] msg goes here foo');
    });

    it('should respect datefmt', function () {
        const f = new formatters.Formatter('%(asctime)s %(message)s', '%a, %b %d, %Y');
        record.created = new Date('2013-12-11T10:09:08Z');
        expect(f.format(record)).to.equal('Wed, Dec 11, 2013 msg goes here foo');
    });

    it('should include logger name', function () {
        const f = new formatters.Formatter('%(name)s');
        record.name = 'test';
        expect(f.format(record)).to.equal('test');
    });

    it('should format in args', function () {
        const f = new formatters.Formatter();
        record.args = ['a', 1, 2, {b: 3}];
        record.msg = '%s %s %s %j';
        expect(f.format(record)).to.equal('a 1 2 {"b":3}');
    });

    it('should append stack trace info', function() {
        const f = new formatters.Formatter();
        const exc = new Error();
        exc.stack = 'a stack';
        record.exc = exc;
        record.msg = 'a message';
        expect(f.format(record)).to.equal('a message foo\na stack');
    });
});
