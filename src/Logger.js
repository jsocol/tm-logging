const levels = require('./levels');
const LogRecord = require('./LogRecord');

function Logger(name, level, _parent, propagate) {
    this.name = name || '';
    this.setLevel(level);
    this.parent = _parent || null;
    this.propagate = typeof propagate === 'undefined' ? true : propagate;
    this.handlers = [];
}


Logger.prototype.setLevel = function $$Logger_setLevel(level) {
    this.level = levels.checkLevel(level);
};


Logger.prototype.isEnabledFor = function $$Logger_isEnabledFor(level) {
    return level >= this.level;
};


Logger.prototype.addHandler = function $$Logger_addHandler(handler) {
    if (-1 === this.handlers.indexOf(handler)) {
        this.handlers.push(handler);
    }
};


function _toArray(args) {
    return Array.prototype.slice.call(args, 0);
}


Logger.prototype.debug = function $$Logger_debug () {
    const args = _toArray(arguments);
    const msg = args.shift();
    this._log(levels.DEBUG, msg, args);
};


Logger.prototype.info = function $$Logger_info () {
    const args = _toArray(arguments);
    const msg = args.shift();
    this._log(levels.INFO, msg, args);
};


Logger.prototype.warn = function $$Logger_warn () {
    const args = _toArray(arguments);
    const msg = args.shift();
    this._log(levels.WARN, msg, args);
};


Logger.prototype.warning = function $$Logger_warning () {
    const args = _toArray(arguments);
    const msg = args.shift();
    this._log(levels.WARNING, msg, args);
};


Logger.prototype.error = function $$Logger_error () {
    const args = _toArray(arguments);
    const msg = args.shift();
    this._log(levels.ERROR, msg, args);
};


Logger.prototype.exception = function $$Logger_exception () {
    const args = _toArray(arguments);
    const exc = args.shift();
    const msg = args.shift();
    this._log(levels.ERROR, msg, args, exc);
};


Logger.prototype.fatal = function $$Logger_fatal () {
    const args = _toArray(arguments);
    const msg = args.shift();
    this._log(levels.FATAL, msg, args);
};


Logger.prototype.log = function $$Logger_log () {
    const args = _toArray(arguments);
    const level = args.shift();
    const msg = args.shift();
    this._log(level, msg, args);
};


Logger.prototype._getContext = function $$Logger__getContext (exc) {
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
        if (frame.indexOf('$$Logger') !== -1 || frame.indexOf('at') === -1) {
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


Logger.prototype._log = function $$Logger__log (level, msg, args, exc) {
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
};


Logger.prototype.handle = function $$Logger_handle (record) {
    if (this.isEnabledFor(record.level)) {
        for (let i=0; i < this.handlers.length; i++) {
            this.handlers[i].handle(record);
        }
    }
    if (this.parent !== null && this.propagate) {
        this.parent.handle(record);
    }
};

module.exports = Logger;
