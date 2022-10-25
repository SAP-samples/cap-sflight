'use strict';

// Example data contains dates/timestamps. Travel app allows to save a tarvel only if both start
// and end date are in the future. So we regularly need to adapt the example data to move all
// dates/timestamps consistently into the future. Originally the data was generated to have flights
// 31 weeks in the future and 21 weeks in the past. Thus we move all dates/timestamps into the future
// by n weeks, and choose n such that the "newest" flight is again 31 weeks in the future.

// We could as well regenerate all the data, but as the current generator works "randomly", the
// tests that rely on certain data would break.

// Time dependent data:
// Flight:            FlightDate (Date)
// Travel:            BeginDate (Date), EndDate (Date), createdAt (Timestamp), LastChangedAt (Timestamp)
// Booking:           BookingDate (Date), FlightDate (Date), LastChangedAt (Timestamp)
// BookingSupplement: LastChangedAt (Timestamp)

// Approach:
// * for Flights:
//   ** read csv -> json
//   ** find latest flight date
//   ** n is number of weeks from that flight to today + 31
//   ** add n weeks to each FlightDate
//   ** write back modified json -> csv
// * for each remaining csv file that contains time dependent data:
//   ** read csv -> json
//   ** for each date/timestamp, add n weeks
//   ** write back modified json -> csv


const csv = require('./csv_helper');

function addDays(dateString, days) {
  var d = new Date(dateString);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0,10);
}
function addDaysTS(timestampString, days) {
  var ts = new Date(timestampString);
  ts.setDate(ts.getDate() + days);
  return ts.toISOString().slice(0, 19)+'Z';
}


let flights = csv.readCSV('Flight');

// find newest flight
let f2 = flights.map(o => o.FlightDate).sort();
let latest = new Date(f2[f2.length-1]);
var today = new Date();
// weeks between latest flight and today + 31
var weeks = Math.floor((today-latest)/(1000*60*60*24*7)) + 31;
if (weeks > 0) {
  console.log("Adding", weeks, "weeks")
} else {
  console.log("Data is ok, nothing to be done");
  process.exit();
}


for (let f of flights) {
  f.FlightDate = addDays(f.FlightDate, weeks*7);
}
csv.writeCSV('Flight', flights);


let travels = csv.readCSV('Travel');
for (let t of travels) {
  t.BeginDate     = addDays(t.BeginDate, weeks*7);
  t.EndDate      = addDays(t.EndDate, weeks*7);
  t.createdAt     = addDaysTS(t.createdAt, weeks*7);
  t.LastChangedAt = addDaysTS(t.LastChangedAt, weeks*7);
}
csv.writeCSV('Travel', travels);


let bookings = csv.readCSV('Booking');
for (let b of bookings) {
  b.BookingDate   = addDays(b.BookingDate, weeks*7);
  b.FlightDate   = addDays(b.FlightDate, weeks*7);
  b.LastChangedAt = addDaysTS(b.LastChangedAt, weeks*7);
}
csv.writeCSV('Booking', bookings);


let supps = csv.readCSV('BookingSupplement');
for (let s of supps) {
  s.LastChangedAt = addDaysTS(s.LastChangedAt, weeks*7);
}
csv.writeCSV('BookingSupplement', supps);
