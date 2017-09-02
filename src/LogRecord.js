const util = require('util');
const formatters = require('./formatters');
const levels = require('./levels');


class LogRecord {
    constructor(name, level, pathname, func, lineno, msg, args, exc, extra) {
        this.name = name;
        this.level = levels.checkLevel(level);
        this.levelName = levels.getLevelName(level);
        this.pathname = pathname;
        this.func = func;
        this.lineno = lineno;
        this.msg = msg;
        this.args = args;
        this.exc = exc;
        this.process = process.pid;
        this.processName = process.title;
        this.created = new Date();
        this.extra = extra || {};
    }

    get message() {
        return this.getMessage();
    }

    getMessage() {
        if (this.args) {
            const a = [this.msg].concat(this.args);
            return util.format.apply(null, a);
        }
        return this.msg;
    }
}


module.exports = LogRecord;
