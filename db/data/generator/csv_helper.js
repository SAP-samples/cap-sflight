// Helper functions to read csv file into json and write json to csv file
//   for Flight, Travel, Booking, BookingSupplement

'use strict';

const m = require('./mapper')

const fs = require('fs')
const {EOL} = require('os');

const path_out = './output/';
const path_csv = '../';
const prefix_sflight = 'sap.fe.cap.travel-';

const config = {
  // ---------- Flight ----------
  Flight: {
    csv_file: prefix_sflight + 'Flight.csv',
    map: m.Maps.Flight,
  },
  // ---------- Travel ----------
  Travel: {
    csv_file: prefix_sflight + 'Travel.csv',
    map: m.Maps.Travel,
  },
  // ---------- Booking ----------
  Booking: {
    csv_file: prefix_sflight + 'Booking.csv',
    map: m.Maps.Booking,
  },
  // ---------- BookingSupplement ----------
  BookingSupplement: {
    csv_file: prefix_sflight + 'BookingSupplement.csv',
    map: m.Maps.Supplement,
  }
};

// table: one of Flight, Travel, Booking, BookingSupplement
// returns array
function readCSV(table) {
  let c = config[table];
  if (!c) throw 'Invalid table name ' + table;

  let s = fs.readFileSync(path_csv + c.csv_file, 'utf8')
  let fromString = (line) => m.string2rGen(line, c.map);
  let a = s.split(/\r?\n/).filter(x => x.includes(';')).slice(1).map(fromString);  // slice: remove header line
  //console.log(JSON.stringify(o, null, 2))
  return a;
}

// table: one of Flight, Travel, Booking, BookingSupplement
// data: array
function writeCSV(table, data) {
  let c = config[table];
  if (!c) throw 'Invalid table name ' + table;

  var a = data.map(x => m.rGen2string(x, c.map));
  a.unshift(m.dbHeader(c.map));
  var s = a.join(EOL);
  fs.writeFileSync(path_out + c.csv_file, s);
}

module.exports = {
  readCSV,
  writeCSV
};
