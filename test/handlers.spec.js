'use strict';

var expect = require('chai').expect;
var sinon = require('sinon');
var formatters = require('../lib/formatters');
var handlers = require('../lib/handlers');
var levels = require('../lib/levels');
var LogRecord = require('../lib/LogRecord');

function mockStream () {
    return {
        write: sinon.spy()
    };
}

describe('Handler', function () {
    var h;

    beforeEach(function () {
        h = new handlers.Handler();
    });

    it('should default to NOTSET level', function () {
        expect(h.level).to.equal(levels.NOTSET);
    });

    it('should accept a level argument', function () {
        var h = new handlers.Handler(levels.INFO);
        expect(h.level).to.equal(levels.INFO);
        h.setLevel(levels.WARNING);
        expect(h.level).to.equal(levels.WARNING);
    });

    it('should not implement emit', function () {
        expect(h.emit).to.throw(/not implemented/i);
    });

    it('should emit when the record level is higher than the handler level', function () {
        h.emit = sinon.spy();
        h.setLevel(levels.INFO);
        h.handle({level: levels.WARNING});
        expect(h.emit.callCount).to.equal(1);
    });

    it('should emit when the record level matches the handler level', function () {
        h.emit = sinon.spy();
        h.setLevel(levels.INFO);
        h.handle({level: levels.INFO});
        expect(h.emit.callCount).to.equal(1);
    });

    it('should not emit when the record level is below the handler level', function () {
        h.emit = sinon.spy();
        h.setLevel(levels.ERROR);
        h.handle({level: levels.INFO});
        expect(h.emit.callCount).to.equal(0);
    });
});

describe('StreamHandler', function () {
    it('should emit to a stream', function () {
        var stream = mockStream();
        var sh = new handlers.StreamHandler(levels.INFO, stream);
        sh.setFormatter(new formatters.Formatter());
        var lr = new LogRecord('foo', levels.WARNING);
        lr.msg = 'hi there';
        sh.handle(lr);
        expect(stream.write.callCount).to.equal(1);
        expect(stream.write.firstCall.args[0]).to.equal('hi there\n');
    });
});

// describe('FileHandler');
