import moment from "moment";
import { PeriodTypes, PeriodSelectorOptions, DateRange } from "./ReactPeriodSelector.types";

export const defaultFormat = "YYYY-MM-DD";

export function getStartOfMonth(date: string): string {
  return getEdgeOfPeriod(date, "month", "start");
}
export function getEndOfMonth(date: string): string {
  return getEdgeOfPeriod(date, "month", "end");
}
export function getStartOfQuarter(date: string): string {
  return getEdgeOfPeriod(date, "quarter", "start");
}
export function getEndOfQuarter(date: string): string {
  return getEdgeOfPeriod(date, "quarter", "end");
}
export function getStartOfYear(date: string): string {
  return getEdgeOfPeriod(date, "year", "start");
}

export function getEndOfYear(date: string): string {
  return getEdgeOfPeriod(date, "year", "end");
}
export function getEdgeOfPeriod(
    date: string,
    periodType: PeriodTypes,
    edge: "start" | "end"
): string {
  if (edge === "start")
    return moment(date)
        .startOf(periodType)
        .format(defaultFormat);
  return moment(date)
      .endOf(periodType)
      .format(defaultFormat);
}

export function getFullMonthRange(dateRange: DateRange): DateRange {
  return getFullPeriodRange(dateRange, "month");
}

export function getFullQuarterRange(dateRange: DateRange): DateRange {
  return getFullPeriodRange(dateRange, "quarter");
}

export function getFullYearRange(dateRange: DateRange): DateRange {
  return getFullPeriodRange(dateRange, "year");
}

function getFullPeriodRange(
    dateRange: DateRange,
    periodType: PeriodTypes
): DateRange {
  const { startDate, endDate } = dateRange;
  const newStartDate: string = moment(startDate)
      .startOf(periodType)
      .format(defaultFormat);
  const newEndDate: string = moment(endDate)
      .endOf(periodType)
      .format(defaultFormat);
  return { startDate: newStartDate, endDate: newEndDate };
}

export function getMonthsInRange(dateRange: DateRange): string[] {
  return getPeriodsInRange(dateRange, "month");
}

export function getQuartersInRange(dateRange: DateRange): string[] {
  return getPeriodsInRange(dateRange, "quarter");
}

export function getYearsInRange(dateRange: DateRange): string[] {
  return getPeriodsInRange(dateRange, "year");
}

function getPeriodsInRange(
    dateRange: DateRange,
    periodType: PeriodTypes
): string[] {
  const { startDate, endDate } = dateRange;
  let startMoment: moment.Moment = moment(startDate);
  let endMoment: moment.Moment = moment(endDate);
  let periods: string[] = [];
  const periodFormat: string = periodType.charAt(0).toUpperCase();

  while (
      endMoment > startMoment ||
      startMoment.format(periodFormat) === endMoment.format(periodFormat)
      ) {
    periods.push(startMoment.format(defaultFormat));
    startMoment.add(1, periodType);
  }
  return periods;
}

export function getOptionsByType(
    dateRange: DateRange,
    periodType: PeriodTypes
): PeriodSelectorOptions {
  const { startDate, endDate } = dateRange;
  let options: PeriodSelectorOptions = {};
  const startMoment = moment(startDate);
  const endMoment = moment(endDate);

  if (endMoment.isBefore(startMoment)) {
    throw "End date must be greater than start date.";
  }

  while (startMoment.isBefore(endMoment)) {
    const dateOption = {
      label:
          periodType === "month"
              ? startMoment.startOf(periodType).format("MMM")
              : `Q${startMoment.startOf(periodType).quarter()}`,
      dateRange: {
        startDate: startMoment.startOf(periodType).format(defaultFormat),
        endDate: startMoment.endOf(periodType).format(defaultFormat)
      }
    };

    let curYear = startMoment.startOf(periodType).format("YYYY");
    if (options[curYear]) {
      options[curYear].push(dateOption);
    } else {
      options[curYear] = [dateOption];
    }

    startMoment.add(1, periodType);
  }
  return options;
}
