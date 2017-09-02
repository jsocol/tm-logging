const expect = require('chai').expect;
const logging = require('../');

describe('getLogger', function () {
    it('returns a logger', function () {
        const logger = logging.getLogger();
        expect(logger).to.be.an.instanceof(logging.Logger);
    });

    it('returns the same root logger', function () {
        const left = logging.getLogger();
        const right = logging.getLogger();
        expect(left).to.equal(right);
    });

    it('returns root logger for empty names', function () {
        const noArgRoot = logging.getLogger();
        const blankStringRoot = logging.getLogger('');
        const rootRoot = logging.getLogger('root');
        expect(noArgRoot).to.equal(blankStringRoot).and.to.equal(rootRoot);
    });

    it('sets parent loggers', function () {
        const root = logging.getLogger();
        const child = logging.getLogger('child');
        expect(child.parent).to.equal(root);
    });

    it('sets and fill in ancestry', function () {
        const root = logging.getLogger();
        const grandchild = logging.getLogger('sister.child');
        const sister = logging.getLogger('sister');
        expect(grandchild.parent).to.equal(sister);
        expect(sister.parent).to.equal(root);
    });

    it('returns the same child loggers', function () {
        const greatleft = logging.getLogger('a.b.c');
        const greatright = logging.getLogger('a.b.c');
        expect(greatleft).to.equal(greatright);
    });
});
