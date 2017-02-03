var NOTSET = 0,
    DEBUG = 10,
    INFO = 20,
    WARN = 30,
    WARNING = WARN,
    ERROR = 40,
    FATAL = 50;

var levelNames = {
    0: '',
    10: 'DEBUG',
    20: 'INFO',
    30: 'WARN',
    40: 'ERROR',
    50: 'FATAL'
};


function getLevelName(level) {
    if (level in levelNames) {
        return levelNames[level];
    }
    return levelNames[NOTSET];
}

module.exports = {
    getLevelName: getLevelName,
    NOTSET: NOTSET,
    DEBUG: DEBUG,
    INFO: INFO,
    WARN: WARN,
    WARNING: WARNING,
    ERROR: ERROR,
    FATAL: FATAL
};
