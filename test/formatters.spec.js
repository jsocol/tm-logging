'use strict';

var expect = require('expect.js');
var formatters = require('../lib/formatters');
var levels = require('../lib/levels');
var LogRecord = require('../lib/LogRecord');

describe('format helper', function () {
    it('should replace named strings', function () {
        expect(formatters.format('hi %(name)s', {name: 'john'})).to.be('hi john');
    });

    it('should replace several variables', function () {
        var values = {
            name: 'john',
            foo: 'bar'
        };
        var result = formatters.format('hi %(name)s %(foo)s %(qux)s %(name)s', values);
        expect(result).to.be('hi john bar undefined john');
    });
});

describe('dateFormat helper', function () {
    xit('should format datetimes', function () {
        var dt = new Date('2012-07-04T12:13:14-0600');
        var format = '%Y-%m-%dT%H:%M:%S %p %a %A %b %B %w %z %%';
        var result = formatters.dateFormat(format, dt);
        expect(result).to.be('2012-07-04T14:13:14 PM Wed Wednesday Jul July 3 0400 %');
    });
});

function makeLogRecord (name) {
    return new LogRecord(name || 'root', levels.INFO, 'foo', 'bar', 12, 'msg goes here', [], null);
}

describe('Formatter', function () {
    it('should return a formatted message by default', function () {
        var f = new formatters.Formatter();
        expect(f.format(makeLogRecord())).to.be('msg goes here');
    });

    xit('should follow a format', function () {
        var f = new formatters.Formatter('%(asctime)s [%(levelName)s] %(pathname)s:%(lineno)s [%(process)s] %(message)s');
        var record = makeLogRecord();
        record.created = new Date('2012-11-10T09:08:07Z');
        record.process = 401;
        expect(f.format(record)).to.be('2012-11-10T04:08:07 [INFO] foo:12 [401] msg goes here');
    });

    it('should respect datefmt', function () {
        var f = new formatters.Formatter('%(asctime)s %(message)s', '%a, %b %d, %Y');
        var record = makeLogRecord();
        record.created = new Date('2013-12-11T10:09:08Z');
        expect(f.format(record)).to.be('Wed, Dec 11, 2013 msg goes here');
    });

    it('should include logger name', function () {
        var f = new formatters.Formatter('%(name)s');
        var record = makeLogRecord('test');
        expect(f.format(record)).to.be('test');
    });

    it('should format in args', function () {
        var f = new formatters.Formatter();
        var record = makeLogRecord();
        record.args = ['a', 1, 2, {b: 3}];
        record.msg = '%s %s %s %j';
        expect(f.format(record)).to.be('a 1 2 {"b":3}');
    });

    it('should append stack trace info', function() {
        var f = new formatters.Formatter();
        var record = makeLogRecord();
        var exc = new Error();
        exc.stack = 'a stack';
        record.exc = exc;
        record.msg = 'a message';
        expect(f.format(record)).to.be('a message\na stack');
    });
});
