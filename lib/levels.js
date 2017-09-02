const NOTSET = 0;
const DEBUG = 10;
const INFO = 20;
const WARN = 30;
const WARNING = WARN;
const ERROR = 40;
const FATAL = 50;

const levelNames = {
    [NOTSET]: '',
    [DEBUG]: 'DEBUG',
    [INFO]: 'INFO',
    [WARN]: 'WARN',
    [ERROR]: 'ERROR',
    [FATAL]: 'FATAL'
};


function getLevelName(level) {
    if (level in levelNames) {
        return levelNames[level];
    }
    return levelNames[NOTSET];
}

module.exports = {
    getLevelName,
    NOTSET,
    DEBUG,
    INFO,
    WARN,
    WARNING,
    ERROR,
    FATAL
};
