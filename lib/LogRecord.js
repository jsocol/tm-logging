'use strict';

var util = require('util');
var formatters = require('./formatters');
var levels = require('./levels');

function LogRecord(name, level, pathname, func, lineno, msg, args, exc, extra) {
    this.name = name;
    this.level = level;
    this.msg = msg;
    this.args = args;
    this.levelName = levels.getLevelName(level);
    this.pathname = pathname;
    this.func = func;
    this.lineno = lineno;
    this.exc = exc;
    this.process = process.pid;
    this.processName = process.title;
    this.created = new Date;
    this.extra = extra || {};
}

LogRecord.prototype.getMessage = function() {
    if (this.args) {
        var a = [this.msg].concat(this.args);
        return util.format.apply(null, a);
    }
    return this.msg;
};

module.exports = LogRecord;
