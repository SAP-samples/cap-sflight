'use strict';

const csv = require('./csv_helper');


let travels = csv.readCSV('Travel');
for (let i=0; i<travels.length; ++i) {
  if (i%5 == 4) travels[i].TravelStatus_code = 'X';
}
csv.writeCSV('Travel', travels);


// let bookings = csv.readCSV('Booking');
// for (let b of bookings) {
//   b.BookingDate   = addDays(b.BookingDate, weeks*7);
//   b.FlightDate    = addDays(b.FlightDate, weeks*7);
//   b.LastChangedAt = addDaysTS(b.LastChangedAt, weeks*7);
// }
// csv.writeCSV('Booking', bookings);


