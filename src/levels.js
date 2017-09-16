const NOTSET = 0;
const DEBUG = 10;
const INFO = 20;
const WARN = 30;
const WARNING = WARN;
const ERROR = 40;
const FATAL = 50;


const LEVELS = {
    NOTSET,
    DEBUG,
    INFO,
    WARN,
    WARNING,
    ERROR,
    FATAL
};


const LEVEL_NAMES = {
    [NOTSET]: '',
    [DEBUG]: 'DEBUG',
    [INFO]: 'INFO',
    [WARN]: 'WARN',
    [ERROR]: 'ERROR',
    [FATAL]: 'FATAL'
};


function getLevelName(level) {
    if (level in LEVEL_NAMES) {
        return LEVEL_NAMES[level];
    }
    return LEVEL_NAMES[NOTSET];
}


function checkLevel(level) {
    if (!level || !LEVEL_NAMES[level]) {
        return NOTSET;
    }
    return level;
}


module.exports = {
    checkLevel,
    getLevelName,
    LEVELS,
    LEVEL_NAMES,
    NOTSET,
    DEBUG,
    INFO,
    WARN,
    WARNING,
    ERROR,
    FATAL
};
