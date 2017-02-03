'use strict';

var util = require('util');
var fs = require('fs');
var formatters = require('./formatters');
var levels = require('./levels');


function Handler(level) {
    this.setLevel(level);
    this.setFormatter(formatters._defaultFormatter);
}


Handler.prototype.setFormatter = function Handler_setFormatter(formatter) {
    this.formatter = formatter;
};


Handler.prototype.format = function Handler_format(record) {
    return this.formatter.format(record);
};


Handler.prototype.setLevel = function Handler_setLevel(level) {
    this.level = !!level ? level : levels.NOTSET;
};


Handler.prototype.handle = function Handler_handle(record) {
    if (record.level >= this.level) {
        this.emit(record);
    }
};


Handler.prototype.emit = function Handler_emit(record) {
    throw new Error('Not Implemented!');
};


function NullHandler(level) {
    Handler.call(this, level);
}


util.inherits(NullHandler, Handler);


NullHandler.prototype.emit = function NullHandler_emit(record) {
    /* Do nothing. */
};


function StreamHandler(level, stream) {
    if (!stream) {
        stream = process.stderr;
    }
    this.stream = stream;
    Handler.call(this, level);
}


util.inherits(StreamHandler, Handler);


StreamHandler.prototype.emit = function StreamHandler_emit(record) {
    this.stream.write(this.format(record) + '\n');
};


function FileHandler(level, path) {
    this.path = path;
    stream = fs.createWriteStream(path, {'flags': 'a+'});
    StreamHandler.call(this, level, stream);
}


util.inherits(FileHandler, StreamHandler);


FileHandler.prototype.reopen = function FileHandler_reopen() {
    this.stream = fs.createWriteStream(this.path, {'flags': 'a+'});
};

module.exports = {
    FileHandler: FileHandler,
    Handler: Handler,
    NullHandler: NullHandler,
    StreamHandler: StreamHandler
};
