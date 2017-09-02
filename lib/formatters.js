function format(msg, record) {
    return msg.replace(/%\((\w+)\)s/g, function(_, key) {
        return record[key];
    });
}


const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                   'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTH_LONG = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
];
const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_LONG = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday'
];


function pad(n) {
    return (n < 10) ? '0' + n.toString() : n;
}


function dateRecord(dt) {
    const w = dt.getDay();
    const m = dt.getMonth();
    const H = dt.getHours();
    const M = dt.getMinutes();
    const S = dt.getSeconds();
    const z = dt.getTimezoneOffset();
    return {
        'a': DAY_SHORT[w],
        'A': DAY_LONG[w],
        'b': MONTH_SHORT[m],
        'B': MONTH_LONG[m],
        'd': pad(dt.getDate()),
        'H': pad(H),
        'm': pad(m + 1),
        'M': pad(M),
        'p': (H > 11) ? 'PM' : 'AM',
        'S': pad(S),
        'w': dt.getDay(),
        'Y': dt.getFullYear(),
        'z': ((z < 0) ? '-' : '') + pad(~~(Math.abs(z) / 60)) + pad(Math.abs(z) % 60),
        '%': '%'
    };
}


function dateFormat(fmt, dt) {
    const rec = dateRecord(dt);
    return fmt.replace(/%([\w%])/g, function (_, key) { return rec[key]; });
}


function Formatter(fmt, datefmt) {
    this.fmt = fmt || '%(message)s';
    this.datefmt = datefmt || '%Y-%m-%dT%H:%M:%S';
}


Formatter.prototype.usesTime = function Formatter_usesTime() {
    return (-1 !== this.fmt.indexOf('%(asctime)s'));
};


Formatter.prototype.format = function Formatter_format(record) {
    if (this.usesTime()) {
        const dt = dateFormat(this.datefmt, record.created || new Date());
        record.asctime = dt;
    }
    record.message = record.getMessage();
    let s = format(this.fmt, record);
    if (record.exc) {
        s += '\n' + record.exc.stack;
    }
    return s;
};

const _defaultFormatter = new Formatter(
    '%(asctime)s [%(levelName)s] %(process)s [%(name)s] %(message)s');
const _standardFormatter = new Formatter(
    '%(asctime)s [%(levelName)s] %(pathname)s:%(lineno)s [%(process)s] %(message)s');

module.exports = {
    Formatter: Formatter,
    _defaultFormatter: _defaultFormatter,
    _standardFormatter: _standardFormatter,
    format: format,
    dateFormat: dateFormat
};
