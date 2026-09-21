/* Overlap engine - timezone intersection math, pure functions.
   The problem: a team across zones needs a meeting time that is inside
   everyone's working hours. Offsets are in minutes east of UTC (browser
   resolves them from IANA zones; tests pass them directly). */
(function (global) {
  'use strict';

  var DAY = 1440;

  // A person's work window [startHour, endHour) local -> list of UTC windows
  // [{start, end}] in minutes, possibly two if it wraps the UTC day.
  function workWindowUTC(offsetMin, startHour, endHour) {
    if (!(startHour >= 0 && startHour < 24 && endHour > 0 && endHour <= 24 && startHour < endHour)) {
      throw new Error('bad hours');
    }
    var s = startHour * 60 - offsetMin;
    var e = endHour * 60 - offsetMin;
    while (s < 0) { s += DAY; e += DAY; }
    while (s >= DAY) { s -= DAY; e -= DAY; }
    if (e <= DAY) return [{ start: s, end: e }];
    return [{ start: 0, end: e - DAY }, { start: s, end: DAY }]; // wraps midnight
  }

  // Intersect two window lists
  function intersect(a, b) {
    var out = [];
    a.forEach(function (w1) {
      b.forEach(function (w2) {
        var s = Math.max(w1.start, w2.start), e = Math.min(w1.end, w2.end);
        if (e > s) out.push({ start: s, end: e });
      });
    });
    return out;
  }

  // Windows where EVERYONE is within work hours (UTC minutes)
  function overlapAll(people) {
    if (!people.length) return [];
    var acc = workWindowUTC(people[0].offset, people[0].start, people[0].end);
    for (var i = 1; i < people.length; i++) {
      acc = intersect(acc, workWindowUTC(people[i].offset, people[i].start, people[i].end));
      if (!acc.length) break;
    }
    return acc;
  }

  // Total overlap minutes
  function totalMinutes(windows) {
    return windows.reduce(function (s, w) { return s + (w.end - w.start); }, 0);
  }

  // Suggest meeting slots: longest windows first, each as {start,end} UTC minutes.
  // Slots must fit `duration` minutes; window shorter than duration yields nothing.
  function suggest(windows, duration) {
    if (!(duration > 0)) throw new Error('bad duration');
    return windows
      .filter(function (w) { return w.end - w.start >= duration; })
      .sort(function (a, b) { return (b.end - b.start) - (a.end - a.start); })
      .map(function (w) { return { start: w.start, end: w.start + duration, windowMinutes: w.end - w.start }; });
  }

  // Convert a UTC-minute instant to a person's local HH:MM (that day)
  function localTime(utcMin, offsetMin) {
    var m = ((utcMin + offsetMin) % DAY + DAY) % DAY;
    var h = Math.floor(m / 60), mm = m % 60;
    return String(h).padStart(2, '0') + ':' + String(mm).padStart(2, '0');
  }

  function utcTime(utcMin) {
    var m = ((utcMin % DAY) + DAY) % DAY;
    return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
  }

  var api = { workWindowUTC: workWindowUTC, intersect: intersect, overlapAll: overlapAll, totalMinutes: totalMinutes, suggest: suggest, localTime: localTime, utcTime: utcTime };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else global.Overlap = api;
})(typeof window !== 'undefined' ? window : globalThis);
