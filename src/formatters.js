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
    const w = dt.getUTCDay();
    const m = dt.getUTCMonth();
    const H = dt.getUTCHours();
    const M = dt.getUTCMinutes();
    const S = dt.getUTCSeconds();
    return {
        'a': DAY_SHORT[w],
        'A': DAY_LONG[w],
        'b': MONTH_SHORT[m],
        'B': MONTH_LONG[m],
        'd': pad(dt.getUTC()Date()),
        'H': pad(H),
        'm': pad(m + 1),
        'M': pad(M),
        'p': (H > 11) ? 'PM' : 'AM',
        'S': pad(S),
        'w': dt.getUTCDay(),
        'Y': dt.getUTCFullYear(),
        'z': 'Z',
        '%': '%'
    };
}


function dateFormat(fmt, dt) {
    const rec = dateRecord(dt);
    return fmt.replace(/%([\w%])/g, function (_, key) { return rec[key]; });
}


class Formatter {
    constructor(fmt = '%(message)s', datefmt = '%Y-%m-%dT%H:%M:%S') {
        this.fmt = fmt;
        this.datefmt = datefmt;
    }

    usesTime() {
        return (-1 !== this.fmt.indexOf('%(asctime)s'));
    }

    format(record) {
        if (this.usesTime()) {
            const dt = dateFormat(this.datefmt, record.created || new Date());
            record.asctime = dt;
        }
        let s = format(this.fmt, record);
        if (record.exc) {
            s += '\n' + record.exc.stack;
        }
        return s;
    }
}


const _defaultFormatter = new Formatter(
    '%(asctime)s [%(levelName)s] %(process)s [%(name)s] %(message)s');
const _standardFormatter = new Formatter(
    '%(asctime)s [%(levelName)s] %(pathname)s:%(lineno)s [%(process)s] %(message)s');


module.exports = {
    Formatter,
    _defaultFormatter,
    _standardFormatter,
    format,
    dateFormat
};
