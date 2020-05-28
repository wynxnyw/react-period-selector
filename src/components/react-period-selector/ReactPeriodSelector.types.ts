export type PeriodTypes = 'month' | 'quarter' | 'week' | 'year'

export const PeriodTypeOptions: PeriodTypes[] = ['month', 'quarter'];

export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface PeriodSelectorOptions {
  [key: string]: {
    label: string;
    dateRange: {
      startDate: string;
      endDate: string;
    };
  }[];
}

export interface PeriodSelectorPreset {
  label: string;
  dateRange: DateRange
}

export interface PeriodSelectorProps {
  onUpdateDateRange: (periodType: PeriodTypes, periodRange: DateRange) => void;
  rangeRestriction?: DateRange
  defaultSelectedRange?: DateRange;
  presets?: PeriodSelectorPreset[];
  defaultPeriodType?: PeriodTypes
}

export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface PeriodSelectorState {
  dateRange: DateRange;
  choosingStart: boolean;
  chosenPreset?: PeriodSelectorPreset
  periodType: PeriodTypes;
  periodRestriction?: PeriodTypes
  options?: PeriodSelectorOptions;
}

export const defaultPeriodSelectorState: PeriodSelectorState = {
  choosingStart: true,
  periodType: 'month',
  dateRange: {
    startDate: '',
    endDate: ''
  }
};

export const defaultStartDate: string = '1963-05-12';
