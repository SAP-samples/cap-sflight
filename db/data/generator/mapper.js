'use strict';

const Maps = {
  Flight: [
    {gen: 'AirlineID',          db: 'AirlineID'        },
    {gen: 'ConnectionID',       db: 'ConnectionID'     },
    {gen: 'FlightDate',         db: 'FlightDate'       },
    {gen: 'Price',              db: 'Price'            },
    {gen: 'CurrencyCode_code',  db: 'CurrencyCode_code'},
    {gen: 'PlaneType',          db: 'PlaneType'        },
    {gen: 'MaximumSeats',       db: 'MaximumSeats'     },
    {gen: 'OccupiedSeats',      db: 'OccupiedSeats'    }
  ],
  Travel: [
    {gen: 'TravelUUID',              db: 'TravelUUID'             },
    {gen: 'TravelID',                db: 'TravelID'               },
    {gen: 'to_Agency_AgencyID',      db: 'to_Agency_AgencyID'     },
    {gen: 'to_Customer_CustomerID',  db: 'to_Customer_CustomerID' },
    {gen: 'BeginDate',               db: 'BeginDate'              },
    {gen: 'EndDate',                 db: 'EndDate'                },
    {gen: 'BookingFee',              db: 'BookingFee'             },
    {gen: 'TotalPrice',              db: 'TotalPrice'             },
    {gen: 'CurrencyCode_code',       db: 'CurrencyCode_code'      },
    {gen: 'Description',             db: 'Description'            },
    {gen: 'TravelStatus_code',       db: 'TravelStatus_code'      },
    {gen: 'createdBy',               db: 'createdBy'              },
    {gen: 'createdAt',               db: 'createdAt'              },
    {gen: 'LastChangedBy',           db: 'LastChangedBy'          },
    {gen: 'LastChangedAt',           db: 'LastChangedAt'          }
  ],
  Booking: [
    {gen: 'BookingUUID',             db: 'BookingUUID'            },
    {gen: 'to_Travel_TravelUUID',    db: 'to_Travel_TravelUUID'   },
    {gen: 'BookingID',               db: 'BookingID'              },
    {gen: 'BookingDate',             db: 'BookingDate'            },
    {gen: 'to_Customer_CustomerID',  db: 'to_Customer_CustomerID' },
    {gen: 'to_Carrier_AirlineID',    db: 'to_Carrier_AirlineID'   },
    {gen: 'ConnectionID',            db: 'ConnectionID'           },
    {gen: 'FlightDate',              db: 'FlightDate'             },
    {gen: 'FlightPrice',             db: 'FlightPrice'            },
    {gen: 'CurrencyCode_code',       db: 'CurrencyCode_code'      },
    {gen: 'BookingStatus_code',      db: 'BookingStatus_code'     },
    {gen: 'LastChangedAt',           db: 'LastChangedAt'          }
  ],
  Supplement: [
    {gen: 'BookSupplUUID',               db: 'BookSupplUUID'              },
    {gen: 'to_Travel_TravelUUID',        db: 'to_Travel_TravelUUID'       },
    {gen: 'to_Booking_BookingUUID',      db: 'to_Booking_BookingUUID'     },
    {gen: 'BookingSupplementID',         db: 'BookingSupplementID'        },
    {gen: 'to_Supplement_SupplementID',  db: 'to_Supplement_SupplementID' },
    {gen: 'Price',                       db: 'Price'                      },
    {gen: 'CurrencyCode_code',           db: 'CurrencyCode_code'          },
    {gen: 'LastChangedAt',               db: 'LastChangedAt'              }
  ]
}

function dbHeader(map) {
  let t = map.map(m => m.db);
  return t.join(';');
}

function rGen2string(rGen, map) {
  let t = rGen2arr(rGen, map);
  return t.join(';');
}

function string2rGen(s, map) {
  var a = s.split(';');
  return arr2rGen(a, map);
}

function rGen2arr(rGen, map) {
  let t = map.map(m => rGen[m.gen]);
  return t;
}

function arr2rGen(arr, map) {
  let rGen = {};
  for (let i = 0; i<map.length; i++) {
    rGen[map[i].gen] = arr[i];
  }
  return rGen;
}

function rGen2rDB(rGen, map) {
  let rDB = {};
  for (let m of map) {
    rDB[m.db] = rGen[m.gen]
  }
  return rDB;
}

module.exports = {
  Maps,
  dbHeader,
  rGen2string,
  string2rGen,
  rGen2arr,
  arr2rGen,
  rGen2rDB
};







/*
// csv header lines for flight, travel, booking, bookingSupplement
const hf = 'AirlineID;ConnectionID;FlightDate;Price;CurrencyCode_code;PlaneType;MaximumSeats;OccupiedSeats';
const ht = 'TravelUUID;TravelID;to_Agency_AgencyID;to_Customer_CustomerID;BeginDate;EndDate;BookingFee;TotalPrice;CurrencyCode_code;Description;TravelStatus_code;createdBy;createdAt;LastChangedBy;LastChangedAt';
const hb = 'BookingUUID;to_Travel_TravelUUID;BookingID;BookingDate;to_Customer_CustomerID;to_Carrier_AirlineID;ConnectionID;FlightDate;FlightPrice;CurrencyCode_code;BookingStatus_code;LastChangedAt';
const hs = 'BookSupplUUID;to_Travel_TravelUUID;to_Booking_BookingUUID;BookingSupplementID;to_Supplement_SupplementID;Price;CurrencyCode_code;LastChangedAt';

function flightToString(f) {
  return [
    f.AirlineID,
    f.ConnectionID,
    f.FlightDate,
    f.Price,
    f.CurrencyCode_code,
    f.PlaneType,
    f.MaximumSeats,
    f.OccupiedSeats
  ].join(';')
}
function stringToFlight(line) {
  var o = {};
  [
    o.AirlineID,
    o.ConnectionID,
    o.FlightDate,
    o.Price,
    o.CurrencyCode_code,
    o.PlaneType,
    o.MaximumSeats,
    o.OccupiedSeats
  ] = line.split(';');
  return o;
}

function travelToString(t) {
  return [
    t.TravelUUID,
    t.TravelID,
    t.to_Agency_AgencyID,
    t.to_Customer_CustomerID,
    t.BeginDate,
    t.EndDate,
    t.BookingFee,
    t.TotalPrice,
    t.CurrencyCode_code,
    t.Description,
    t.TravelStatus_code,
    t.createdBy,
    t.createdAt,
    t.LastChangedBy,
    t.LastChangedAt
  ].join(';');
}
function stringToTravel(line) {
  var o = {};
  [
    o.TravelUUID,
    o.TravelID,
    o.to_Agency_AgencyID,
    o.to_Customer_CustomerID,
    o.BeginDate,
    o.EndDate,
    o.BookingFee,
    o.TotalPrice,
    o.CurrencyCode_code,
    o.Description,
    o.TravelStatus_code,
    o.createdBy,
    o.createdAt,
    o.LastChangedBy,
    o.LastChangedAt
  ] = line.split(';');
  return o;
}

function bookingToString(b) {
  return [
    b.BookingUUID,
    b.to_Travel_TravelUUID,
    b.BookingID,
    b.BookingDate,
    b.to_Customer_CustomerID,
    b.to_Carrier_AirlineID,
    b.ConnectionID,
    b.FlightDate,
    b.FlightPrice,
    b.CurrencyCode_code,
    b.BookingStatus_code,
    b.LastChangedAt
  ].join(';');
}
function stringToBooking(line) {
  var o = {};
  [
    o.BookingUUID,
    o.to_Travel_TravelUUID,
    o.BookingID,
    o.BookingDate,
    o.to_Customer_CustomerID,
    o.to_Carrier_AirlineID,
    o.ConnectionID,
    o.FlightDate,
    o.FlightPrice,
    o.CurrencyCode_code,
    o.BookingStatus_code,
    o.LastChangedAt
  ] = line.split(';');
  return o;
}

function bookingSupplementToString(s) {
  return [
    s.BookSupplUUID,
    s.to_Travel_TravelUUID,
    s.to_Booking_BookingUUID,
    s.BookingSupplementID,
    s.to_Supplement_SupplementID,
    s.Price,
    s.CurrencyCode_code,
    s.lastChanLastChangedAtgedAt
  ].join(';');
}
function stringToSupplement(line) {
  var o = {};
  [
    o.BookSupplUUID,
    o.to_Travel_TravelUUID,
    o.to_Booking_BookingUUID,
    o.BookingSupplementID,
    o.to_Supplement_SupplementID,
    o.Price,
    o.CurrencyCode_code,
    o.LastChangedAt
  ] = line.split(';');
  return o;
}

*/
