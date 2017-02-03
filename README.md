# TodaysMeet  Logging

Roughly a port of Python's logging lib (itself a port of Log4j) for
node.


```js
const logging = require('tm-logging');

let log = logging.getLogger();  // Root logger
log.addHandler(logging.StreamHandler());

// In another module;
const logging = require('tm-logging');

// Will use the root logger
logging.debug('a message: with=%d params=%s', 123, 'hi');

let log = logging.getLogger('mymodule');
log.warning('propagates up to the root logger');
```

The logger can also format arguments into the log message:

```js
log.warning('user not found: id=%d', userId);
```


## Installing

Many features of `tm-logging` depend on there being a single instance of
the module, so it is strongly recommended that `tm-logging` be a
`dependency` of the top-level application, and that any library modules
list it as a `peerDependency`.


## Loggers

`Logger` objects can be configured with levels, names, formatters, and
handlers, all documented below. To create a new `Logger`, use the the
`getLogger` method:

```js
const logging = require('tm-logging');
const logger = logging.getLogger('my.module');
```

`getLogger` takes two optional arguments: a `level` and a `propagate`
boolean. `level` should be one of the following constants:

```js
logging.DEBUG
logging.INFO
logging.WARN === logging.WARNING
logging.ERROR
logging.FATAL
```

The logger will only "handle" messages at its level or higher. The
logger's level can be changed by calling `logger.setLevel`.

`propagate` controls whether the log messages will also be handled by
ancestor loggers. See the **Hierarchical Loggers** section below for
more details.


### Levels

Loggers have the standard logging levels from Log4j / Python (and the
root logger can be accessed with shortcuts on the `logging` module):

```js
const logging = require('tm-logging');
logging.addHandler(new logging.StreamHandler());

logging.debug('a debug message');

logging.info('an informational message');

logging.warn('a recoverable but unexpected state');
logging.warning('an alias for warn()');

logging.error('an error condition');

const err = new Error();
logging.exception(err, 'an exception with a traceback');

logging.fatal('an unrecoverable state, will exit with status 1');
```

### Hierarchical Loggers

Loggers are hierarchical. At the the base of the hierarchy is the "root
logger," which is returned when no name, or `'root'`, is passed to
`getLogger` (and when the module-level shortcuts are used).

Other loggers can be defined within the hierarchy based on their names.
For example:

```js
const logging = require('tm-logging');

const rootLogger = logging.getLogger();
rootLogger.addHandler(new logging.StreamHandler());

const myAppLogger = logging.getLogger('myapp');
myAppLogger.addHandler(new logging.FileHandler(null, 'myapp.log'));

const myModuleLogger = logging.getLogger('myapp.mymodule');
const myNonPropagatingLogger = logging.getLogger('myapp.noprop', null, false);
```

Messages will be "handled" by the logger they are sent to, and also any
"ancestors". So

```js
myModuleLogger.warning('a warning in a module');
```

Will be handled by `myModuleLogger` (which has no handlers defined), and
then propagate up to `myAppLogger`, which is logging to `myapp.log`, and
finally propagate up to the `rootLogger`, which will log to stderr.

However,

```js
myNonPropagatingLogger.warning('will not propagate');
```

Since the `propagate` argument was set to `false`, this message will not
be handled by any ancestors. (And since `myNonPropagatingLogger` doesn't
have any handlers defined, the message will not be handled at all.)


## Formatters

Log formatters control the ultimate output of the log message. They are
attached to [handlers](#handlers). To create a new formatter:

```js
const logging = require('tm-logging');
const formatter = new logging.Formatter(myLogFormat, myDateFormat);
```

### Log Format Strings

The default log format is:

```js
'%(asctime)s [%(levelName)s] %(process)s [%(name)s] %(message)s'
```

Format strings can use the `%(propName)s` format to access any property
of a [`LogRecord`](#logrecord) instance. Only `%(asctime)s` and
`%(message)s` are handled specially. These are:

- `name` - the name of the logger
- `level` - the level of the current message as a number
- `levelName` - the name of the level of the current message as a string
- `pathname` - the file from which this message originated
- `func` - the name of the function from which this message originated
- `lineno` - the line from which this message originated
- `process` - the process ID as a number
- `processName` the process title
- `message` - the formatted message passed to the logger
- `asctime` - the formatted timestamp


### Date Format Strings

`%(asctime)s` will be replaced with the date the log message was
created, formatted according to the date format string, which uses
[strftime](http://strftime.org/) conventions. It defaults to ISO8601:

```js
'%Y-%m-%dT%H:%M:%S'
```

The available values are

- `%%` - a literal `%`
- `%A` - long day name (e.g. `Monday`)
- `%B` - long month name (e.g. `August`)
- `%H` - 2-digit hour (0-23)
- `%M` - 2-digit minutes (0-60)
- `%S` - 2-digit seconds (0-61)
- `%Y` - 4-digit year (e.g. `2016`)
- `%a` - short day name (e.g. `Tue`)
- `%b` - short month name (e.g. `Apr`)
- `%d` - 2-digit day of the month (`01-31`)
- `%m` - 2-digit month (`01-12`)
- `%p` - AM/PM (e.g. `PM`)
- `%w` - day of the week (0-6)
- `%z` - timezone offset (e.g. `-0400`)

## Handlers

Log handlers determine how output is handled. Their API is small:

- Handlers should inherit from `tm-logging.Handler`.
- The first argument to the constructor should be a log level.
- Handlers must expose an `emit()` method that takes a `LogRecord`
  instance and does _something_ with it.

Several handlers are included:

- `NullHandler(level)` throws away all log messages it receives. Useful
  for silencing loggers.
- `StreamHandler(level, [stream])` writes newline-delimited log messages
  to any node stream. If a stream is not specified, `process.stderr` is
  used by default.
- `FileHandler(level, path)` writes newline-delimited log messages to a
  file. The file will be created and opened for appending. `FileHandler`
  instances also have a `reopen()` method that will re-open the file,
  e.g. after rotating.
