'use strict';

var levels = require('./levels');
var LogRecord = require('./LogRecord');

function Logger(name, level, _parent, propagate) {
    this.name = name || '';
    this.setLevel(level);
    this._parent = _parent || null;
    this.propagate = typeof propagate === 'undefined' ? true : propagate;
    this.handlers = [];
}


Logger.prototype.setLevel = function $$Logger_setLevel(level) {
    this.level = level || levels.NOTSET;
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
    var args = _toArray(arguments);
    var msg = args.shift();
    this._log(levels.DEBUG, msg, args);
};


Logger.prototype.info = function $$Logger_info () {
    var args = _toArray(arguments);
    var msg = args.shift();
    this._log(levels.INFO, msg, args);
};


Logger.prototype.warn = function $$Logger_warn () {
    var args = _toArray(arguments);
    var msg = args.shift();
    this._log(levels.WARN, msg, args);
};


Logger.prototype.warning = function $$Logger_warning () {
    var args = _toArray(arguments);
    var msg = args.shift();
    this._log(levels.WARNING, msg, args);
};


Logger.prototype.error = function $$Logger_error () {
    var args = _toArray(arguments);
    var msg = args.shift();
    this._log(levels.ERROR, msg, args);
};


Logger.prototype.exception = function $$Logger_exception () {
    var args = _toArray(arguments);
    var exc = args.shift();
    var msg = args.shift();
    this._log(levels.ERROR, msg, args, exc);
};


Logger.prototype.fatal = function $$Logger_fatal () {
    var args = _toArray(arguments);
    var msg = args.shift();
    this._log(levels.ERROR, msg, args);
    process.exit(1);
};


Logger.prototype.log = function $$Logger_log () {
    var level = Array.prototype.shift.call(arguments);
    var msg = Array.prototype.shift.call(arguments);
    this._log(level, msg, arguments);
};


Logger.prototype._getContext = function $$Logger__getContext (exc) {
    if (typeof exc === 'undefined' || typeof exc.stack !== 'string') {
        try {
            throw new Error();
        } catch (e) {
            exc = e;
        }
    }
    var frames = exc.stack.split('\n');
    for (var i = 0; i < frames.length; i++) {
        var frame = frames[i].trim();
        if (frame.indexOf('$$Logger') !== -1 || frame.indexOf('at') === -1) {
            continue;
        }
        try {
            var groups = /at (\S+) .*\((.*):(\d+):(\d+)\)/.exec(frame);
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
    var context = this._getContext(exc);
    var record = new LogRecord(
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
        for (var i=0; i < this.handlers.length; i++) {
            this.handlers[i].handle(record);
        }
    }
    if (this._parent !== null && this.propagate) {
        this._parent.handle(record);
    }
};

module.exports = Logger;
