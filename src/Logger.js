const levels = require('./levels');
const LogRecord = require('./LogRecord');

class Logger {
    constructor(name = 'root', level = levels.NOTSET, parent = null, propagate = true) {
        this.name = name || 'root';
        this.setLevel(level);
        this.parent = parent;
        this.propagate = propagate === true;
        this.handlers = [];
    }

    setLevel(level) {
        this.level = levels.checkLevel(level);
    }

    isEnabledFor(level) {
        return level >= this.level;
    }

    addHandler(handler) {
        if (-1 === this.handlers.indexOf(handler)) {
            this.handlers.push(handler);
        }
    }

    removeHandler(handler) {
        const idx = this.handlers.indexOf(handler);
        if (-1 !== idx) {
            this.handlers.splice(idx, 1);
        }
    }

    hasHandlers() {
        let logger = this;
        while (logger) {
            if (logger.handlers.length > 0) {
                return true;
            }
            logger = logger.parent;
        }
        return false;
    }

    getEffectiveLevel() {
        let logger = this;
        while (logger) {
            if (logger.level) {
                return logger.level;
            }
            logger = logger.parent;
        }
        return levels.NOTSET;
    }

    debug() {
        const args = Array.from(arguments);
        const msg = args.shift();
        this._log(levels.DEBUG, msg, args);
    }

    info() {
        const args = Array.from(arguments);
        const msg = args.shift();
        this._log(levels.INFO, msg, args);
    }

    warn() {
        const args = Array.from(arguments);
        const msg = args.shift();
        this._log(levels.WARN, msg, args);
    }

    warning() {
        const args = Array.from(arguments);
        const msg = args.shift();
        this._log(levels.WARNING, msg, args);
    }

    error() {
        const args = Array.from(arguments);
        const msg = args.shift();
        this._log(levels.ERROR, msg, args);
    }

    exception() {
        const args = Array.from(arguments);
        const exc = args.shift();
        const msg = args.shift();
        this._log(levels.ERROR, msg, args, exc);
    }

    fatal() {
        const args = Array.from(arguments);
        const msg = args.shift();
        this._log(levels.FATAL, msg, args);
    }

    log() {
        const args = Array.from(arguments);
        const level = args.shift();
        const msg = args.shift();
        this._log(level, msg, args);
    }

    _getContext(exc) {
        if (typeof exc === 'undefined' || typeof exc.stack !== 'string') {
            try {
                throw new Error();
            } catch (e) {
                exc = e;
            }
        }
        const frames = exc.stack.split('\n');
        for (let i = 0; i < frames.length; i++) {
            const frame = frames[i].trim();
            if (frame.indexOf('src/Logger.js') !== -1 || frame.indexOf('at') === -1) {
                continue;
            }
            try {
                const groups = /at (\S+) .*\((.*):(\d+):(\d+)\)/.exec(frame);
                if (!groups) {
                    continue;
                }
                return {
                    func: groups[1] || '',
                    pathname: groups[2],
                    lno: groups[3],
                    col: groups[4]
                };
            } catch (e) {
                console.error('_getContext', e);
            }
        }
        return {
            func: '',
            pathname: '',
            lno: '',
            col: ''
        };
    }

    _log(level, msg, args, exc) {
        const context = this._getContext(exc);
        const record = new LogRecord(
            this.name,
            level,
            context.pathname,
            context.func,
            context.lno,
            msg,
            args,
            exc);
        this.handle(record);
    }

    handle(record) {
        if (this.isEnabledFor(record.level)) {
            for (let i=0; i < this.handlers.length; i++) {
                this.handlers[i].handle(record);
            }
        }
        if (this.parent !== null && this.propagate) {
            this.parent.handle(record);
        }
    }
}

module.exports = Logger;
