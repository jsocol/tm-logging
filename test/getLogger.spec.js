'use strict';

var expect = require('chai').expect;
var logging = require('../');

describe('getLogger', function () {
    it('should return a logger', function () {
        var l = logging.getLogger();
        expect(l).to.be.an.instanceof(logging.Logger);
    });

    it('should return the same root logger', function () {
        var left = logging.getLogger();
        var right = logging.getLogger();
        expect(left).to.equal(right);
    });

    it('should set parent loggers', function () {
        var root = logging.getLogger();
        var child = logging.getLogger('child');
        expect(child._parent).to.equal(root);
    });

    it('should set and fill in ancestry', function () {
        var root = logging.getLogger();
        var grandchild = logging.getLogger('sister.child');
        var sister = logging.getLogger('sister');
        expect(grandchild._parent).to.equal(sister);
        expect(sister._parent).to.equal(root);
    });

    it('should return the same child loggers', function () {
        var greatleft = logging.getLogger('a.b.c');
        var greatright = logging.getLogger('a.b.c');
        expect(greatleft).to.equal(greatright);
    });
});
