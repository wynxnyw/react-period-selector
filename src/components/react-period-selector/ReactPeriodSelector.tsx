import React, { useState, useEffect, useRef } from 'react';
import {
  PeriodSelectorProps,
  PeriodSelectorState,
  DateRange,
  defaultPeriodSelectorState,
  PeriodSelectorPreset,
  getEdgeOfPeriod,
  PeriodTypeOptions, getOptionsByType
} from "./";
import './react-period-selector.scss'
import Moment from 'moment'

export function ReactPeriodSelector(props: PeriodSelectorProps) {
  const { onUpdateDateRange, defaultRange, presets, defaultPeriodType } = props;

  const [state, setState] = useState<PeriodSelectorState>(defaultPeriodSelectorState);
  const [showPeriodSelector, setShowPeriodSelector] = useState<boolean>(false);
  const {dateRange, choosingStart, chosenPreset, periodType, periodRestriction, options} = state;
  //used for click out events
  const node = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef<boolean>(true);

  useEffect(() => {
    document.addEventListener("mousedown", closeDatePicker);

    let newDateRange;

    if(isInitialMount.current) {
      newDateRange = defaultRange ?? dateRange
      isInitialMount.current = false;
    }
    else {
      newDateRange = {
        startDate: getEdgeOfPeriod(dateRange.startDate, periodType, 'start'),
        endDate: getEdgeOfPeriod(dateRange.endDate, periodType, 'end')
      };
    }

    const options = getOptionsByType(defaultRange ?? dateRange, periodType);
    const newPeriodType = periodRestriction ? periodRestriction : defaultPeriodType ? defaultPeriodType : periodType;


    setState({...state, dateRange: newDateRange, periodType: newPeriodType, options});
    return () => {
      document.removeEventListener("mousedown", closeDatePicker);
    };
  }, [periodType]);

  function closeDatePicker(e: any) {
    if (!node.current?.contains(e.target)) {
      setShowPeriodSelector(false)
    }
    return;
  }

  function updateDates(selectedDateRange: DateRange){
    //we will create a new state object in case we have to switch the current selection to the start date in the event the new end date occurs BEFORE the current start date
    let newState = {...state, dateRange: {startDate: '', endDate: ''}};
    //update the left side of the date range when choosing the start date
    if(choosingStart) {
      //if the new start date is after the new end date, set end date to ''
      const newEndDate = Moment(selectedDateRange.startDate).isAfter(Moment(dateRange.endDate)) ? '' : dateRange.endDate;
      newState = {...state, choosingStart: false, chosenPreset: undefined, dateRange: {startDate: selectedDateRange.startDate, endDate: newEndDate}}
    } else {
      //if the new end date is before the start date, set this as the new start date and clear the end date
      const isBeforeStart = Moment(selectedDateRange.endDate).isBefore(Moment(dateRange.startDate));
      const newStartDate = isBeforeStart ? getEdgeOfPeriod(selectedDateRange.endDate, periodType, 'start') : dateRange.startDate;
      const newEndDate = selectedDateRange.endDate;
      newState = {...state, choosingStart: !isBeforeStart, chosenPreset: undefined, dateRange: {startDate: newStartDate, endDate: newEndDate}};
      if(!isBeforeStart) setShowPeriodSelector(false)
    }
    setState(newState);
    //grab new report if both dates are valid
    if(newState.dateRange.startDate !== '' && newState.dateRange.endDate !== '') onUpdateDateRange(periodType, newState.dateRange);
  }

  function selectPreset(preset: PeriodSelectorPreset) {
    setState({...state, choosingStart: true, dateRange: preset.dateRange, chosenPreset: preset});
    onUpdateDateRange(periodType, preset.dateRange)
  }

  function writeLabel(range: 'range1' | 'range2'){
    let active = false;
    //only if the picker is active are we going to highlight which selection the user is making
    if(showPeriodSelector) {
      if(choosingStart && range === 'range1') active = true;
      if(!choosingStart && range === 'range2') active = true
    }
    //identify in advance which end of the date range will be handled by click events
    const rangeSide = range === 'range1' ? 'startDate' : 'endDate';

    //write dashes placeholder if no date selected
    if(dateRange[rangeSide] === '') return <span className={active ? 'text-info' : ''}>_ _ _ _</span>;

    let label = '';
    if(periodType === 'month') label = Moment(dateRange[rangeSide]).format('MMM, YYYY');
    if(periodType === 'quarter') label = 'Q' + Moment(dateRange[rangeSide]).format('Q, YYYY');

    return (
        <span
            className={active ? 'text-info' : ''}
            //if the datepicker is already closed lets open it, otherwise lets change the range side
            onClick={() => handleClickLabel(range)}
        >{label}</span>
    )
  }

  function handleClickLabel(range: 'range1' | 'range2') {
    setState({...state, choosingStart: range === 'range1'});
    setShowPeriodSelector(true);
  }

  function isStartDate(currentDateRange: DateRange) {
    const first = Moment(dateRange.startDate).format(`${periodType.charAt(0).toUpperCase()}, YYYY`);
    const second = Moment(currentDateRange.startDate).format(`${periodType.charAt(0).toUpperCase()}, YYYY`);
    return first === second
  }
  function isEndDate(currentDateRange: DateRange) {
    const first = Moment(dateRange.endDate).format(`${periodType.charAt(0).toUpperCase()}, YYYY`);
    const second = Moment(currentDateRange.endDate).format(`${periodType.charAt(0).toUpperCase()}, YYYY`);
    return first === second
  }
  function isInRange(currentDateRange: DateRange){
    return Moment(currentDateRange.startDate).isBetween(dateRange.startDate, dateRange.endDate);
  }

  const writeHeader = () => (
      <div className='ps-header'>
        { PeriodTypeOptions.map((PeriodTypeOption, index) => (
            <span key={index}
                  className={`ps-header-type ${periodType === PeriodTypeOption && 'active'}`}
                  onClick={() => PeriodTypeOption && setState({...state, periodType: PeriodTypeOption})}>
          {PeriodTypeOption}
        </span>
        ))}
      </div>
  );

  const writePresets = () => (
      <div className='ps-presets float-left'>
        {
          presets?.map((x: PeriodSelectorPreset) => (
              <div className={`ps-preset text-center ${x.label === chosenPreset?.label && 'active'}`} onClick={() => selectPreset(x)}>
                {x.label}
              </div>
          ))
        }
      </div>
  );

  const writeOptions = (x: any) =>  {
    return x.map((y: any) => {
      let classes = 'ps-option';
      if(isStartDate(y.dateRange)) classes+= ' ps-edge ps-edge-start';
      else if(isEndDate(y.dateRange)) classes+= ' ps-edge ps-edge-end';

      if(isInRange(y.dateRange)) classes+= ' ps-range';
      return (
          <div className={classes} onClick={() => updateDates(y.dateRange)}>
            {y.label}
          </div>
      )
    })
  };

  return (
      <div className='ReactPeriodSelector ps' ref={node}>
        <h4 className=" cursor-pointer" aria-expanded="true">
          {dateRange.startDate === '' ? '_ _ _ _' : writeLabel('range1')} - {dateRange.endDate === '' ? '_ _ _ _' : writeLabel('range2')}
          &nbsp;<i className="fas fa-chevron-down fa-1x" onClick={() => setShowPeriodSelector(!showPeriodSelector)}/>
        </h4>
        <div className={`dropdown-menu dropdown-menu-fit dropdown-menu-right metrics-dropdown good-shadow ${showPeriodSelector && 'show'} ${presets ? 'ps-with-presets' : 'ps-without-presets'}`} x-placement="bottom-left">
          {!periodRestriction && writeHeader()}
          { presets && writePresets()}
          <div className='row ps-options'>
            {
              options &&
              Object.entries(options).map(x => (
                      <>
                        <div className='col-12 ps-options-header text-left'>
                          <span className='cursor-pointer cat'>{x[0]}</span>
                        </div>
                        { writeOptions(x[1]) }
                      </>
                  )
              )
            }
          </div>
        </div>
      </div>
  )
}
