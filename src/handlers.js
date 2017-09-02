const util = require('util');
const fs = require('fs');
const formatters = require('./formatters');
const levels = require('./levels');


class Handler {
    constructor(level) {
        this.setLevel(level);
        this.setFormatter(formatters._defaultFormatter);
    }

    setFormatter(formatter) {
        this.formatter = formatter;
    }

    format(record) {
        return this.formatter.format(record);
    }

    get level() {
        return this._level;
    }

    set level(level) {
        this.setLevel(level);
    }

    setLevel(level) {
        this._level = levels.checkLevel(level);
    }

    isEnabledFor(level) {
        return level >= this.level;
    }

    handle(record) {
        if (this.isEnabledFor(record.level)) {
            this.emit(record);
        }
    }

    emit(record) {
        throw new Error('Not Implemented!');
    }
}


class NullHandler extends Handler {
    emit() {
        // Bye, bye, bye
    }
}


class StreamHandler extends Handler {
    constructor(level, stream = process.stderr) {
        if (typeof level !== 'number' && level) {
            stream = level;
            level = levels.NOTSET;
        }
        super(level);
        this.stream = stream;
    }

    emit(record) {
        if (!this.stream.write(this.format(record) + '\n')) {
            const _this = this;
            this.stream.once('drain', function () {
                _this.emit(record);
            });
        }
    }
}


class FileHandler extends StreamHandler {
    constructor(level, path) {
        if (typeof level !== 'number' && level) {
            path = level;
            level = levels.NOTSET;
        }
        const stream = fs.createWriteStream(path, {'flags': 'a+'});
        super(level, stream);
    }

    get path() {
        return this.stream.path;
    }

    reopen() {
        this.stream = fs.createWriteStream(this.path, {'flags': 'a+'});
    }
}


module.exports = {
    FileHandler,
    Handler,
    NullHandler,
    StreamHandler
};
