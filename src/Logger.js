const levels = require('./levels');
const LogRecord = require('./LogRecord');

class Logger {
    constructor(name = 'root', level = levels.NOTSET, parent = null, propagate = true) {
        this.name = name;
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
        let logger = this;
        let found = false;
        while (logger) {
            if (logger.isEnabledFor(record.level)) {
                for (let i = 0; i < logger.handlers.length; i++) {
                    const handler = logger.handlers[i];
                    if (logger.handlers[i].isEnabledFor(record.level)) {
                        found = true;
                    }
                    logger.handlers[i].handle(record);
                }
            }
            if (!logger.propagate) {
                logger = null;
            } else {
                logger = logger.parent;
            }
        }

        if (!found) {
            process.stderr.write(`No handlers could be found for logger "${this.name}"\n`);
        }
    }
}

module.exports = Logger;
