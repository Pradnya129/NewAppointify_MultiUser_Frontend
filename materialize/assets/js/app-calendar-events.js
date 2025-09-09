/**
 * App Calendar Events
 */

'use strict';

let date = new Date();
let nextDay = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
// prettier-ignore
let nextMonth = date.getMonth() === 11 ? new Date(date.getFullYear() + 1, 0, 1) : new Date(date.getFullYear(), date.getMonth() + 1, 1);
// prettier-ignore
let prevMonth = date.getMonth() === 11 ? new Date(date.getFullYear() - 1, 0, 1) : new Date(date.getFullYear(), date.getMonth() - 1, 1);

window.events = [
  {
    id: 1,
    url: '',
    title: 'Basic Consultation Plan',
    start: date,
    end: nextDay,
    allDay: false,
    extendedProps: {
      calendar: 'Plan 1'
    }
  },
  {
    id: 2,
    url: '',
    title: 'Comprehensive Therapy Plan',
    start: new Date(date.getFullYear(), date.getMonth() + 1, -11),
    end: new Date(date.getFullYear(), date.getMonth() + 1, -10),
    allDay: true,
    extendedProps: {
      calendar: 'Plan 2'
    }
  },
  {
    id: 3,
    url: '',
    title: 'Intensive Mental Wellness Plan',
    allDay: true,
    start: new Date(date.getFullYear(), date.getMonth() + 1, -9),
    end: new Date(date.getFullYear(), date.getMonth() + 1, -7),
    extendedProps: {
      calendar: 'Plan 3'
    }
  }
  
];
