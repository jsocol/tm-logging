const util = require('util');
const fs = require('fs');
const formatters = require('./formatters');
const handlers = require('./handlers');
const levels = require('./levels');
const Logger = require('./Logger');
const LogRecord = require('./LogRecord');


process.__loggerCache = process.__loggerCache || {};


function getLogger(name, level, propagate) {
    if (!name) {
        name = 'root';
    }

    if (process.__loggerCache[name] instanceof Logger) {
        return process.__loggerCache[name];
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

    process.__loggerCache[name] = new Logger(name, level, parent, propagate);
    return process.__loggerCache[name];
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
    addHandler: _rootLogger.addHandler.bind(_rootLogger),
    removeHandler: _rootLogger.removeHandler.bind(_rootLogger)
};
