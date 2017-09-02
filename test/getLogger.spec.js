const expect = require('chai').expect;
const logging = require('../');

describe('getLogger', function () {
    it('should return a logger', function () {
        const logger = logging.getLogger();
        expect(logger).to.be.an.instanceof(logging.Logger);
    });

    it('should return the same root logger', function () {
        const left = logging.getLogger();
        const right = logging.getLogger();
        expect(left).to.equal(right);
    });

    it('should set parent loggers', function () {
        const root = logging.getLogger();
        const child = logging.getLogger('child');
        expect(child.parent).to.equal(root);
    });

    it('should set and fill in ancestry', function () {
        const root = logging.getLogger();
        const grandchild = logging.getLogger('sister.child');
        const sister = logging.getLogger('sister');
        expect(grandchild.parent).to.equal(sister);
        expect(sister.parent).to.equal(root);
    });

    it('should return the same child loggers', function () {
        const greatleft = logging.getLogger('a.b.c');
        const greatright = logging.getLogger('a.b.c');
        expect(greatleft).to.equal(greatright);
    });
});
