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
  Flight: {
    csv_file: prefix_sflight + 'Flight.csv',
    map: m.Maps.Flight,
  },
  Travel: {
    csv_file: prefix_sflight + 'Travel.csv',
    map: m.Maps.Travel,
  },
  Booking: {
    csv_file: prefix_sflight + 'Booking.csv',
    map: m.Maps.Booking,
  },
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
  let lines = s.split(/\r?\n/).filter(x => x.includes(';')).slice(1);  // slice: remove header line
  return m.arrString2arrObj(lines, c.map)
}

// table: one of Flight, Travel, Booking, BookingSupplement
// data: array of objs
function writeCSV(table, data, doSort) {
  let c = config[table];
  if (!c) throw 'Invalid table name ' + table;

  let lines = m.arrObj2arrString(data, c.map);
  if (doSort) lines.sort();
  lines.unshift(m.dbHeader(c.map));
  let s = lines.join(EOL);

  if (!fs.existsSync(path_out)) fs.mkdirSync(path_out);
  fs.writeFileSync(path_out + c.csv_file, s);
}

module.exports = {
  readCSV,
  writeCSV
};
