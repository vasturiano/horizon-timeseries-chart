import {
  timeSecond,
  utcSecond,
  timeMinute,
  utcMinute,
  timeHour,
  utcHour,
  timeDay,
  utcDay,
  timeWeek,
  utcWeek,
  timeMonth,
  utcMonth,
  timeYear,
  utcYear
} from 'd3-time';
import { timeFormat, utcFormat } from 'd3-time-format';

const local = {
  second: timeSecond,
  minute: timeMinute,
  hour: timeHour,
  day: timeDay,
  week: timeWeek,
  month: timeMonth,
  year: timeYear
};
const utc = {
  second: utcSecond,
  minute: utcMinute,
  hour: utcHour,
  day: utcDay,
  week: utcWeek,
  month: utcMonth,
  year: utcYear
};

const formats = {
  millisecond: () => '.%L',
  second: () => ':%S',
  minute: ({ use24hFormat }) => `%${use24hFormat ? 'H' : 'I'}:%M`,
  hour: ({ use24hFormat }) => (use24hFormat ? '%H:%M' : '%I %p'),
  day: () => '%a %d',
  week: () => '%b %d',
  month: () => '%b',
  year: () => '%Y'
};

export default function({ useUtc = false, use24hFormat = false }) {
  const formatOpts = { use24hFormat };
  const formatFn = useUtc ? utcFormat : timeFormat;
  const f = Object.assign(
    {},
    ...Object.entries(formats).map(([unit, fn]) => ({
      [unit]: formatFn(fn(formatOpts))
    }))
  );

  const t = useUtc ? utc : local;

  return date =>
    (t.second(date) < date
      ? f.millisecond
      : t.minute(date) < date
        ? f.second
        : t.hour(date) < date
          ? f.minute
          : t.day(date) < date
            ? f.hour
            : t.month(date) < date
              ? t.week(date) < date
                ? f.day
                : f.week
              : t.year(date) < date
                ? f.month
                : f.year)(date);
}
