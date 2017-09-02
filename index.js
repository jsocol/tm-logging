const util = require('util');
const fs = require('fs');
const formatters = require('./lib/formatters');
const handlers = require('./lib/handlers');
const levels = require('./lib/levels');
const Logger = require('./lib/Logger');
const LogRecord = require('./lib/LogRecord');


const loggerCache = {};


function getLogger(name, level, propagate) {
    if (!name) {
        name = 'root';
    }

    if (loggerCache[name] instanceof Logger) {
        return loggerCache[name];
    }

    let parent = null;
    if (name !== 'root') {
        if (name.indexOf('.') === -1) {
            parent = getLogger('root');
        } else {
            const ancestors = name.split('.').slice(0, -1);
            parent = getLogger(ancestors.join('.'));
        }
    }

    loggerCache[name] = new Logger(name, level, parent, propagate);
    return loggerCache[name];
}


const _rootLogger = getLogger();


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

    Logger,
    LogRecord,

    getLogger,

    debug: _rootLogger.debug.bind(_rootLogger),
    info: _rootLogger.info.bind(_rootLogger),
    warning: _rootLogger.warning.bind(_rootLogger),
    error: _rootLogger.error.bind(_rootLogger),
    exception: _rootLogger.exception.bind(_rootLogger),
    fatal: _rootLogger.fatal.bind(_rootLogger),

    setLevel: _rootLogger.setLevel.bind(_rootLogger),
    addHandler: _rootLogger.addHandler.bind(_rootLogger)
};
