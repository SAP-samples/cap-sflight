// ABAP: /dmo/cl_flight_data_generator

'use strict';

const g = require('./generator')
const m = require('./mapper')

const fs = require('fs');
const {EOL} = require('os');
const e = require('express');



function renderFlights(flights) {
  var af = flights.map(f => m.rGen2string(f, m.Maps.Flight)).sort();
  af.unshift(m.dbHeader(m.Maps.Flight));
  var sf = af.join(EOL);
  return sf;
}

function renderTravels(travels) {
  var at = [m.dbHeader(m.Maps.Travel)];
  var ab = [m.dbHeader(m.Maps.Booking)];
  var as = [m.dbHeader(m.Maps.Supplement)];
  for (let t of travels) {
    at.push(m.rGen2string(t, m.Maps.Travel));
    for (let b of t.bookings) {
      ab.push(m.rGen2string(b, m.Maps.Booking));
      for (let s of b.booking_supplements) {
        as.push(m.rGen2string(s, m.Maps.Supplement));
      }
    }
  }
  var st = at.join(EOL);
  var sb = ab.join(EOL);
  var ss = as.join(EOL);
  return {st, sb, ss};
}

function separateTravels(tt) {
  var tb = [];
  var ts = [];
  for (let t of tt) {
    for (let b of t.bookings) {
      ts = ts.concat(b.booking_supplements)
      delete b.booking_supplements;
    }
    tb = tb.concat(t.bookings)
    delete t.bookings;
  }
  return {tt, tb, ts};
}

function clock() {
  let dursum = 0;
  function pass(index) {
    let generator = getGenerator();
    let flights = generator.getFlights();

    let start = Date.now();
    let travels = generator.getTravels();
    let millis = Date.now() - start;
    dursum += millis/1000;
    console.log("pass", index+1, ", duration:", millis/1000, "s");

    let countTravels = travels.length;
    let countBookings = travels.reduce((a,c) => a + c.bookings.length, 0);
    let countBookingSupplements = travels.reduce((a,c) => a + c.bookings.reduce((a,c) => a + c.booking_supplements.length, 0), 0);
    let f_book = Math.round(countBookings/countTravels*100)/100;
    let f_supp = Math.round(countBookingSupplements/countBookings*100)/100;
    console.log(flights.length, countTravels, f_book, countBookings, f_supp, countBookingSupplements)

    flights = null;
    travels = null;
    generator = null;
  }

  const repeats = 10;
  for (let i=0; i<repeats; i++) {
    pass(i);
  }

  console.log("\naverage duration:", dursum/repeats);
}







var generator = g.getGenerator();
var flights = generator.getFlights();
var travels = generator.getTravels(3);


var countTravels = travels.length;
var countBookings = travels.reduce((a,c) => a + c.bookings.length, 0);
var countBookingSupplements = travels.reduce((a,c) => a + c.bookings.reduce((a,c) => a + c.booking_supplements.length, 0), 0);
var f_book = Math.round(countBookings/countTravels*100)/100;
var f_supp = Math.round(countBookingSupplements/countBookings*100)/100;

console.log('#F:', flights.length,
            '\n#T:', countTravels,
            '#B:', countBookings,
            '#S:', countBookingSupplements,
            '\n#B/#T:', f_book,
            '#S/#B:', f_supp)

//console.log(JSON.stringify(travels,null,2));


// let sf = renderFlights(flights);
// console.log(sf);
// console.log();

let {st, sb, ss} = renderTravels(travels);

//console.log(st);
// console.log();
//console.log(sb);
// console.log();
 console.log(ss);

// fs.writeFileSync("./output/sap.fe.cap.travel-Flight.csv", sf);
// fs.writeFileSync("./output/sap.fe.cap.travel-Travel.csv", st);
// fs.writeFileSync("./output/sap.fe.cap.travel-Booking.csv", sb);
// fs.writeFileSync("./output/sap.fe.cap.travel-BookingSupplement.csv", ss);


//let {tt, tb, ts} = separateTravels(travels);

// console.log(tb)
// console.log(tb)
// console.log(ts)
//console.log(tt.length, tb.length, ts.length)






