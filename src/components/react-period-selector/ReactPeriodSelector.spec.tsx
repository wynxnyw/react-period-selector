import React from 'react';
import {ReactPeriodSelector, PeriodSelectorProps, defaultFormat, defaultStartDate, DateRange} from "./";
import {mount} from "enzyme";
import moment from "moment";

describe('React PeriodSelector', () => {
  const makeComponent = (props?: Partial<PeriodSelectorProps>) => mount(<ReactPeriodSelector onUpdateDateRange={jest.fn()} {...props} key='i' />);
  const defaultRange: DateRange = {
    startDate: moment().subtract(1, 'year').format(defaultFormat),
    endDate: moment().format(defaultFormat)
  };
  it('renders the base component with default settings', () => {
    const component = makeComponent();
    const options = component.find('.ps-options').find('.ps-option');
    const cat = component.find('.ps-options').find('.cat');

    expect(component.exists(ReactPeriodSelector)).toEqual(true);
    expect(cat.at(0).text()).toContain(moment(defaultStartDate).format('YYYY'));
    expect(cat.at(cat.length - 1).text()).toContain(moment().format('YYYY'));
    expect(options.at(0).text()).toContain(moment(defaultStartDate).format('MMM'));
    expect(options.at(options.length - 1).text()).toContain(moment().format('MMM'));
  });
  it('renders correct range restriction', () => {
    const defaultStartMoment = moment().subtract(1, 'year');
    const component = makeComponent({rangeRestriction: defaultRange});
    const options = component.find('.ps-options').find('.ps-option');
    const cat = component.find('.ps-options').find('.cat');

    expect(cat.at(0).text()).toContain(defaultStartMoment.format('YYYY'));
    expect(cat.at(cat.length - 1).text()).toContain(moment().format('YYYY'));
    expect(options.at(0).text()).toContain(defaultStartMoment.format('MMM'));
    expect(options.at(options.length - 1).text()).toContain(moment().format('MMM'));
  });
  it('renders the correct default selected range', () => {
    const component = makeComponent({defaultSelectedRange: defaultRange});
    const startDateOption = component.find('.ps-edge-start');
    const endDateOption = component.find('.ps-edge-end');
    expect(startDateOption.text()).toContain(moment(defaultRange.startDate).format('MMM'));
    expect(endDateOption.text()).toContain(moment(defaultRange.endDate).format('MMM'));
  });
  it('renders the presets and updates correctly', () => {
    const startPrev = moment().subtract(2, 'month').startOf('month').format(defaultFormat);
    const endPrev = moment().subtract(1, 'month').startOf('month').format(defaultFormat);
    const presets = [
      {
        label: 'Last Month',
        dateRange: {
          startDate: startPrev,
          endDate: endPrev,
        },
      },
      {
        label: 'Default Date Range',
        dateRange: defaultRange
      }
    ];
    const component = makeComponent({rangeRestriction: defaultRange, presets});
    const compPresets = component.find('.ps-presets').find('.ps-preset');
    presets.forEach((x, i) => {
      expect(compPresets.at(i).text()).toContain(presets[i].label)
    });
    compPresets.at(0).simulate('click');
    component.update();
    expect(component.find('.ps-edge-start').text()).toContain(moment(startPrev).format('MMM'));
    expect(component.find('.ps-edge-end').text()).toContain(moment(endPrev).format('MMM'));

    compPresets.at(1).simulate('click');
    component.update();
    expect(component.find('.ps-edge-start').text()).toContain(moment(defaultRange.startDate).format('MMM'));
    expect(component.find('.ps-edge-end').text()).toContain(moment(defaultRange.endDate).format('MMM'));
  });
  it('renders the correct period type, and changes on click', () => {
    const component = makeComponent({defaultPeriodType: 'quarter'});
    expect(component.find('.ps-header').find('.active').text()).toContain('quarter');
    component.find('.ps-header-type').at(0).simulate('click');
    expect(component.find('.ps-header').find('.active').text()).toContain('month');
  })
});
