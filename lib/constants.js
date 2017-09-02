const NOTSET = 0;
const DEBUG = 10;
const INFO = 20;
const WARN = 30;
const WARNING = WARN;
const ERROR = 40;
const FATAL = 50;

const levelNames = {
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
