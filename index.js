'use strict';

var util = require('util');
var fs = require('fs');
var formatters = require('./lib/formatters');
var handlers = require('./lib/handlers');
var levels = require('./lib/levels');
var Logger = require('./lib/Logger');
var LogRecord = require('./lib/LogRecord');


var loggerCache = {};

function getLogger(name, level, propagate) {
    if (!name) {
        name = 'root';
    }

    if (loggerCache[name] instanceof Logger) {
        return loggerCache[name];
    }

    var _parent = null;
    if (name !== 'root') {
        if (name.indexOf('.') === -1) {
            _parent = getLogger('root');
        } else {
            var ancestors = name.split('.').slice(0, -1);
            _parent = getLogger(ancestors.join('.'));
        }
    }

    loggerCache[name] = new Logger(name, level, _parent, propagate);
    return loggerCache[name];
}

var _rootLogger = getLogger();

module.exports = {
    DEBUG: levels.DEBUG,
    INFO: levels.INFO,
    WARN: levels.WARN,
    WARNING: levels.WARNING,
    ERROR: levels.ERROR,
    FATAL: levels.FATAL,
    getLevelName: levels.getLevelName,

    Formatter: formatters.Formatter,
    Handler: handlers.Handler,
    StreamHandler: handlers.StreamHandler,
    FileHandler: handlers.FileHandler,
    NullHandler: handlers.NullHandler,
    Logger: Logger,
    LogRecord: LogRecord,

    getLogger: getLogger,

    debug: _rootLogger.debug.bind(_rootLogger),
    info: _rootLogger.info.bind(_rootLogger),
    warning: _rootLogger.warning.bind(_rootLogger),
    error: _rootLogger.error.bind(_rootLogger),
    exception: _rootLogger.exception.bind(_rootLogger),
    fatal: _rootLogger.fatal.bind(_rootLogger),

    setLevel: _rootLogger.setLevel.bind(_rootLogger),
    addHandler: _rootLogger.addHandler.bind(_rootLogger)
};
