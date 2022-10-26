// ABAP: /dmo/cl_flight_data_generator

'use strict';

const g = require('./generator')
const m = require('./mapper')
const csv = require('./csv_helper');
const {EOL} = require('os');


function render(data, map, doSort) {
  var strarr = arrObj2arrString(data, map)
  if (doSort) strarr.sort();
  strarr.unshift(m.dbHeader(map));
  return strarr.join(EOL);
}


function clock() {
  let dursum = 0;
  function pass(index) {
    let generator = getGenerator();
    let flights = generator.getFlights();

    let start = Date.now();
    let {at, ab, as} = generator.getTravels();

    let millis = Date.now() - start;
    dursum += millis/1000;
    console.log("pass", index+1, ", duration:", millis/1000, "s");

    var countTravels = at.length;
    var countBookings = ab.length;
    var countBookingSupplements = as.length;
    let f_book = Math.round(countBookings/countTravels*100)/100;
    let f_supp = Math.round(countBookingSupplements/countBookings*100)/100;
    console.log(flights.length, countTravels, f_book, countBookings, f_supp, countBookingSupplements)

    flights = null;
    at = ab = as = null;
    generator = null;
  }

  const repeats = 10;
  for (let i=0; i<repeats; i++) {
    pass(i);
  }

  console.log("\naverage duration:", dursum/repeats);
}



var generator = g.getGenerator();
var tf = generator.getFlights();
let {tt, tb, ts} = generator.getTravels(5000);

var countTravels = tt.length;
var countBookings = tb.length;
var countBookingSupplements = ts.length;
var f_book = Math.round(countBookings/countTravels*100)/100;
var f_supp = Math.round(countBookingSupplements/countBookings*100)/100;

console.log('#F:', tf.length,
            '\n#T:', countTravels, '#B:', countBookings, '#S:', countBookingSupplements,
            '\n#B/#T:', f_book, '#S/#B:', f_supp)



csv.writeCSV('Flight', tf, true);
csv.writeCSV('Travel', tt);
csv.writeCSV('Booking', tb);
csv.writeCSV('BookingSupplement', ts);



// console.log(tf)
// console.log(tb)
// console.log(tb)
// console.log(ts)
// console.log(JSON.stringify(tf,null,2));

// let sf = render(tf, m.Maps.Flight, true)
// let st = render(tt, m.Maps.Travel)
// let sb = render(tb, m.Maps.Booking)
// let ss = render(ts, m.Maps.Supplement)

// console.log(sf);
// console.log();
// console.log(st);
// console.log();
// console.log(sb);
// console.log();
// console.log(ss);
