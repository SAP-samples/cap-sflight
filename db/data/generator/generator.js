// ABAP: /dmo/cl_flight_data_generator

'use strict';

const {v1 : uuidv4} = require('uuid');
const makeRealUUID = () => uuidv4().replace(/-/g, '');

// data used as input for data generation
const passengers = require('./input/customer.json');
const supplements = require('./input/supplement.json');
const countries = require('./input/countries.json');
const agencies = require('./input/agencies.json');

const airports = [
  // Europe
  { airport_id : 'FRA', name : 'Frankfurt Airport',                     city : 'Frankfurt/Main',                    country : 'DE' },
  { airport_id : 'HAM', name : 'Hamburg Airport',                       city : 'Hamburg',                           country : 'DE' },
  { airport_id : 'MUC', name : 'Munich Airport',                        city : 'Munich',                            country : 'DE' },
  { airport_id : 'SXF', name : 'Berlin Schönefeld Airport',             city : 'Berlin',                            country : 'DE' },
  { airport_id : 'THF', name : 'Berlin Tempelhof Airport',              city : 'Berlin',                            country : 'DE' },
  { airport_id : 'TXL', name : 'Berlin Tegel Airport',                  city : 'Berlin',                            country : 'DE' },
  { airport_id : 'CDG', name : 'Charles de Gaulle Airport',             city : 'Paris',                             country : 'FR' },
  { airport_id : 'ORY', name : 'Orly Airport',                          city : 'Paris',                             country : 'FR' },
  { airport_id : 'VIE', name : 'Vienna International Airport',          city : 'Vienna',                            country : 'AT' },
  { airport_id : 'ZRH', name : 'Zürich Airport',                        city : 'Zurich',                            country : 'CH' },
  { airport_id : 'RTM', name : 'Rotterdam The Hague Airport',           city : 'Rotterdam',                         country : 'NL' },
  { airport_id : 'FCO', name : 'Leonardo da Vinci–Fiumicino Airport',   city : 'Rome',                              country : 'IT' },
  { airport_id : 'VCE', name : 'Venice Marco Polo Airport',             city : 'Venice',                            country : 'IT' },
  { airport_id : 'LCY', name : 'London City Airport',                   city : 'London',                            country : 'UK' },
  { airport_id : 'LGW', name : 'Gatwick Airport',                       city : 'London',                            country : 'UK' },
  { airport_id : 'LHR', name : 'Heathrow Airport',                      city : 'London',                            country : 'UK' },
  { airport_id : 'MAD', name : 'Adolfo Suárez Madrid–Barajas Airport',  city : 'Madrid',                            country : 'ES' },
  { airport_id : 'VKO', name : 'Vnukovo International Airport',         city : 'Moscow',                            country : 'RU' },
  { airport_id : 'SVO', name : 'Sheremetyevo International Airport',    city : 'Moscow',                            country : 'RU' },
  // America
  { airport_id : 'JFK', name : 'John F. Kennedy International Airport', city : 'New York City, New York',           country : 'US' },
  { airport_id : 'BNA', name : 'Nashville International Airport',       city : 'Nashville, Tennessee',              country : 'US' },
  { airport_id : 'BOS', name : 'Logan International Airport',           city : 'Boston, Massachusetts',             country : 'US' },
  { airport_id : 'ELP', name : 'El Paso International Airport',         city : 'El Paso, Texas',                    country : 'US' },
  { airport_id : 'DEN', name : 'Denver International Airport',          city : 'Denver, Colorado',                  country : 'US' },
  { airport_id : 'HOU', name : 'William P. Hobby Airport',              city : 'Houston, Texas',                    country : 'US' },
  { airport_id : 'LAS', name : 'McCarran International Airport',        city : 'Las Vegas, Nevada',                 country : 'US' },
  { airport_id : 'LAX', name : 'Los Angeles International Airport',     city : 'Los Angeles, California',           country : 'US' },
  { airport_id : 'MCI', name : 'Kansas City International Airport',     city : 'Kansas City, Missouri',             country : 'US' },
  { airport_id : 'MIA', name : 'Miami International Airport',           city : 'Miami, Florida',                    country : 'US' },
  { airport_id : 'SFO', name : 'San Francisco International Airport',   city : 'San Francisco, California',         country : 'US' },
  { airport_id : 'EWR', name : 'Newark Liberty International Airport',  city : 'Newark, New Jersey',                country : 'US' },
  { airport_id : 'YOW', name : 'Ottawa Macdonald–Cartier Int. Airport', city : 'Ottawa, Ontario',                   country : 'CA' },
  { airport_id : 'ACA', name : 'General Juan N. Álvarez Int. Airport',  city : 'Acapulco, Guerrero',                country : 'MX' },
  { airport_id : 'GIG', name : 'Rio de Janeiro–Galeão Int. Airport',    city : 'Rio de Janeiro',                    country : 'BR' },
  { airport_id : 'HAV', name : 'José Martí International Airport',      city : 'Havana',                            country : 'CU' },
  // Australia
  { airport_id : 'ASP', name : 'Alice Springs Airport',                 city : 'Alice Springs, Northern Territory', country : 'AU' },
  // Africa
  { airport_id : 'ACE', name : 'Lanzarote Airport',                     city : 'Lanzarote, Canary Islands',         country : 'ES' },
  { airport_id : 'HRE', name : 'Harare International Airport',          city : 'Harare',                            country : 'ZW' },
  { airport_id : 'GCJ', name : 'Grand Central Airport',                 city : 'Johannesburg',                      country : 'SA' },
  // Asia
  { airport_id : 'NRT', name : 'Narita International Airport',          city : 'Tokyo, Honshu',                     country : 'JP' },
  { airport_id : 'ITM', name : 'Osaka International Airport',           city : 'Osaka, Honshu',                     country : 'JP' },
  { airport_id : 'KIX', name : 'Kansai International Airport',          city : 'Osaka, Honshu',                     country : 'JP' },
  { airport_id : 'HIJ', name : 'Hiroshima Airport',                     city : 'Hiroshima, Honshu',                 country : 'JP' },
  { airport_id : 'SIN', name : 'Singapore Changi Airport',              city : 'Singapore',                         country : 'SG' },
  { airport_id : 'KUL', name : 'Kuala Lumpur International Airport',    city : 'Kuala Lumpur',                      country : 'MY' },
  { airport_id : 'HKG', name : 'Hong Kong International Airport',       city : 'Hongkong',                          country : 'CN' },
  { airport_id : 'BKK', name : 'Suvarnabhumi Airport',                  city : 'Bangkok',                           country : 'TH' }
];
// TODO AT, CH, NL, IT, UK, ES, RU, MX, BR, CU, ZW, SA, JP, SG, MY, TH missing in table of countries

const firstNames = [
  { first_name : 'Simon', gender : 'M'},
  { first_name : 'Harish', gender : 'M'},
  { first_name : 'Volker', gender : 'M'},
  { first_name : 'Jasmin', gender : 'F'},
  { first_name : 'Felix', gender : 'M'},
  { first_name : 'Kristina', gender : 'F'},
  { first_name : 'Thilo', gender : 'M'},
  { first_name : 'Andrej', gender : 'M'},
  { first_name : 'Anna', gender : 'F'},
  { first_name : 'Johannes', gender : 'M'},
  { first_name : 'Johann', gender : 'M'},
  { first_name : 'Christoph', gender : 'M'},
  { first_name : 'Andreas', gender : 'M'},
  { first_name : 'Stephen', gender : 'M'},
  { first_name : 'Mathilde', gender : 'F'},
  { first_name : 'August', gender : 'M'},
  { first_name : 'Illya', gender : 'M'},
  { first_name : 'Georg', gender : 'M'},
  { first_name : 'Gisela', gender : 'F'},
  { first_name : 'Christa', gender : 'F'},
  { first_name : 'Holm', gender : 'M'},
  { first_name : 'Irmtraut', gender : 'F'},
  { first_name : 'Ludwig', gender : 'M'},
  { first_name : 'Laura', gender : 'F'},
  { first_name : 'Kurt', gender : 'M'},
  { first_name : 'Guenther', gender : 'M'},
  { first_name : 'Horst', gender : 'M'},
  { first_name : 'Matthias', gender : 'M'},
  { first_name : 'Amelie', gender : 'F'},
  { first_name : 'Walter', gender : 'M'},
  { first_name : 'Sophie', gender : 'F'},
  { first_name : 'Claire', gender : 'F'},
  { first_name : 'Chantal', gender : 'F'},
  { first_name : 'Jean', gender : 'M'},
  { first_name : 'Cindy', gender : 'F'},
  { first_name : 'Pierre', gender : 'M'},
  { first_name : 'Irene', gender : 'F'},
  { first_name : 'Adam', gender : 'M'},
  { first_name : 'Fabio', gender : 'M'},
  { first_name : 'Lothar', gender : 'M'},
  { first_name : 'Annemarie', gender : 'F'},
  { first_name : 'Ida', gender : 'F'},
  { first_name : 'Roland', gender : 'M'},
  { first_name : 'Achim', gender : 'M'},
  { first_name : 'Allen', gender : 'M'},
  { first_name : 'Lee', gender : 'M'},
  { first_name : 'Guillermo', gender : 'M'},
  { first_name : 'Florian', gender : 'M'},
  { first_name : 'Ulla', gender : 'F'},
  { first_name : 'Juan', gender : 'M'},
  { first_name : 'Marta', gender : 'F'},
  { first_name : 'Salvador', gender : 'M'},
  { first_name : 'Christine', gender : 'F'},
  { first_name : 'Dominik', gender : 'M'},
  { first_name : 'Astrid', gender : 'F'},
  { first_name : 'Ruth', gender : 'F'},
  { first_name : 'Theresia', gender : 'F'},
  { first_name : 'Thomas', gender : 'M'},
  { first_name : 'Friedrich', gender : 'M'},
  { first_name : 'Anneliese', gender : 'F'},
  { first_name : 'Peter', gender : 'M'},
  { first_name : 'Anne-Marie', gender : 'F'},
  { first_name : 'James', gender : 'M'},
  { first_name : 'Jean-Luc', gender : 'M'},
  { first_name : 'Benjamin', gender : 'M'},
  { first_name : 'Hendrik', gender : 'M'},
  { first_name : 'Uli', gender : 'F'},
  { first_name : 'Siegfried', gender : 'M'},
  { first_name : 'Max', gender : 'M'}
];

const lastNames = [
  { last_name : 'Buchholm'},
  { last_name : 'Vrsic'},
  { last_name : 'Jeremias'},
  { last_name : 'Gutenberg'},
  { last_name : 'Fischmann'},
  { last_name : 'Columbo'},
  { last_name : 'Neubasler'},
  { last_name : 'Martin'},
  { last_name : 'Detemple'},
  { last_name : 'Barth'},
  { last_name : 'Benz'},
  { last_name : 'Hansmann'},
  { last_name : 'Koslowski'},
  { last_name : 'Wohl'},
  { last_name : 'Koller'},
  { last_name : 'Hoffen'},
  { last_name : 'Dumbach'},
  { last_name : 'Goelke'},
  { last_name : 'Waldmann'},
  { last_name : 'Mechler'},
  { last_name : 'Buehler'},
  { last_name : 'Heller'},
  { last_name : 'Simonen'},
  { last_name : 'Henry'},
  { last_name : 'Marshall'},
  { last_name : 'Legrand'},
  { last_name : 'Jacqmain'},
  { last_name : 'D´Oultrement'},
  { last_name : 'Hunter'},
  { last_name : 'Delon'},
  { last_name : 'Kreiss'},
  { last_name : 'Trensch'},
  { last_name : 'Cesari'},
  { last_name : 'Matthaeus'},
  { last_name : 'Babilon'},
  { last_name : 'Zimmermann'},
  { last_name : 'Kramer'},
  { last_name : 'Illner'},
  { last_name : 'Pratt'},
  { last_name : 'Gahl'},
  { last_name : 'Benjamin'},
  { last_name : 'Miguel'},
  { last_name : 'Weiss'},
  { last_name : 'Sessler'},
  { last_name : 'Montero'},
  { last_name : 'Domenech'},
  { last_name : 'Moyano'},
  { last_name : 'Sommer'},
  { last_name : 'Schneider'},
  { last_name : 'Eichbaum'},
  { last_name : 'Gueldenpfennig'},
  { last_name : 'Sudhoff'},
  { last_name : 'Lautenbach'},
  { last_name : 'Ryan'},
  { last_name : 'Prinz'},
  { last_name : 'Deichgraeber'},
  { last_name : 'Pan'},
  { last_name : 'Lindwurm'},
  { last_name : 'Kirk'},
  { last_name : 'Picard'},
  { last_name : 'Sisko'},
  { last_name : 'Madeira'},
  { last_name : 'Meier'},
  { last_name : 'Rahn'},
  { last_name : 'Leisert'},
  { last_name : 'Müller'},
  { last_name : 'Mustermann'},
  { last_name : 'Becker'},
  { last_name : 'Fischer'}
];

const connections = [
  // ! weekday here 1=Mon..7=Sun !
  { AirlineID : 'SW', ConnectionID : '0001', airport_from_id : 'SFO', airport_to_id : 'SIN', departure_time : '011500', arrival_time : '115000', distance : 13523, distance_unit : 'KM', weekday : 3 },
  { AirlineID : 'SW', ConnectionID : '0002', airport_from_id : 'SIN', airport_to_id : 'SFO', departure_time : '063000', arrival_time : '091500', distance : 13523, distance_unit : 'KM', weekday : 4 },
  { AirlineID : 'SW', ConnectionID : '0011', airport_from_id : 'NRT', airport_to_id : 'SIN', departure_time : '145500', arrival_time : '205000', distance :  5363, distance_unit : 'KM', weekday : 4 },
  { AirlineID : 'SW', ConnectionID : '0012', airport_from_id : 'SIN', airport_to_id : 'NRT', departure_time : '095300', arrival_time : '175400', distance :  5363, distance_unit : 'KM', weekday : 6 },
  { AirlineID : 'SW', ConnectionID : '0058', airport_from_id : 'SFO', airport_to_id : 'FRA', departure_time : '134500', arrival_time : '095500', distance :  9608, distance_unit : 'KM', weekday : 1 },
  { AirlineID : 'SW', ConnectionID : '0059', airport_from_id : 'FRA', airport_to_id : 'SFO', departure_time : '135500', arrival_time : '163000', distance :  9608, distance_unit : 'KM', weekday : 2 },
  { AirlineID : 'SW', ConnectionID : '1537', airport_from_id : 'EWR', airport_to_id : 'MIA', departure_time : '215600', arrival_time : '004700', distance :  1752, distance_unit : 'KM', weekday : 5 },
  { AirlineID : 'GA', ConnectionID : '0322', airport_from_id : 'MIA', airport_to_id : 'EWR', departure_time : '201700', arrival_time : '231900', distance :  1752, distance_unit : 'KM', weekday : 7 },
  { AirlineID : 'GA', ConnectionID : '0017', airport_from_id : 'MIA', airport_to_id : 'HAV', departure_time : '071900', arrival_time : '080300', distance :   520, distance_unit : 'KM', weekday : 3 },
  { AirlineID : 'GA', ConnectionID : '2678', airport_from_id : 'HAV', airport_to_id : 'MIA', departure_time : '061500', arrival_time : '103000', distance :   520, distance_unit : 'KM', weekday : 6 },
  { AirlineID : 'GA', ConnectionID : '0015', airport_from_id : 'JFK', airport_to_id : 'SFO', departure_time : '071300', arrival_time : '100400', distance :  4156, distance_unit : 'KM', weekday : 5 },
  { AirlineID : 'GA', ConnectionID : '0018', airport_from_id : 'SFO', airport_to_id : 'JFK', departure_time : '064000', arrival_time : '150600', distance :  4156, distance_unit : 'KM', weekday : 4 },
  { AirlineID : 'EA', ConnectionID : '0400', airport_from_id : 'FRA', airport_to_id : 'JFK', departure_time : '101000', arrival_time : '113400', distance :  6162, distance_unit : 'KM', weekday : 6 },
  { AirlineID : 'EA', ConnectionID : '0401', airport_from_id : 'JFK', airport_to_id : 'FRA', departure_time : '183000', arrival_time : '074500', distance :  6162, distance_unit : 'KM', weekday : 5 },
  { AirlineID : 'EA', ConnectionID : '0402', airport_from_id : 'FRA', airport_to_id : 'EWR', departure_time : '133000', arrival_time : '153500', distance :  6217, distance_unit : 'KM', weekday : 1 },
  { AirlineID : 'EA', ConnectionID : '0403', airport_from_id : 'EWR', airport_to_id : 'FRA', departure_time : '180900', arrival_time : '073000', distance :  6217, distance_unit : 'KM', weekday : 1 },
  { AirlineID : 'OC', ConnectionID : '0407', airport_from_id : 'NRT', airport_to_id : 'FRA', departure_time : '132300', arrival_time : '155600', distance :  9379, distance_unit : 'KM', weekday : 5 },
  { AirlineID : 'OC', ConnectionID : '0408', airport_from_id : 'FRA', airport_to_id : 'NRT', departure_time : '202500', arrival_time : '154000', distance :  9379, distance_unit : 'KM', weekday : 6 },
  { AirlineID : 'FA', ConnectionID : '0788', airport_from_id : 'VCE', airport_to_id : 'NRT', departure_time : '132500', arrival_time : '101300', distance :  9595, distance_unit : 'KM', weekday : 6 },
  { AirlineID : 'FA', ConnectionID : '0789', airport_from_id : 'NRT', airport_to_id : 'VCE', departure_time : '142600', arrival_time : '213100', distance :  9595, distance_unit : 'KM', weekday : 5 }
];

const carriers = [
  { AirlineID : 'GA', name : 'Green Albatros',    CurrencyCode_code : 'CAD' },
  { AirlineID : 'FA', name : 'Fly Africa',        CurrencyCode_code : 'ZAR' },
  { AirlineID : 'EA', name : 'European Airlines', CurrencyCode_code : 'EUR' },
  { AirlineID : 'OC', name : 'Oceania',           CurrencyCode_code : 'USD' },
  { AirlineID : 'SW', name : 'Sunset Wings',      CurrencyCode_code : 'USD' }
];

const plane_types = {
  short_distance: [
    { id : 'A320-200', MaximumSeats : 130},
    { id : 'A321-200', MaximumSeats : 150},
    { id : '737-800' , MaximumSeats : 140},
    { id : 'A319-100', MaximumSeats : 120}
  ],
  long_distance: [
    { id : '747-400' , MaximumSeats : 385},
    { id : '767-200' , MaximumSeats : 260},
    { id : 'A340-600', MaximumSeats : 330},
    { id : 'A380-800', MaximumSeats : 475}
  ]
};




// parameters to influence data generation:

// number of days between flights of a connection, usually set to a multiple of 7
// this is the main parameter to control size of travels/bookings/bookingSupplements
// roughly:
// interval | #travels | #bookings | #bookingSupplements
// ---------+----------+-----------+--------------------
//      300 |    3.000 |     9.000 |              16.000
//       56 |    9.500 |    31.000 |              55.000
//       28 |   19.000 |    61.000 |             110.000
//       14 |   36.000 |   120.000 |             210.000
//        7 |   71.000 |   230.000 |             410.000






function getGenerator() {
  var seed = 6;
  const ran = {
    bookingDateOffset: function() {return random(0, 20)},
    travelChangeDate : function() {return random(0, 20)},
    tripLength       : function() {return random(1, 5)},
    groupSize        : function() {return random(1, 3)},
    supplementCount  : function() {return random(0, 5)},
    entryOf          : function(a) {return a[random(0, a.length-1)];}
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

  //let makeUUID = makeRealUUID;
  let makeUUID = pseudoUuid;

  let flights  = [];
  let g_travelId = 1;
  makeFlights();

  return {
    getFlights: (function() {
      return flights;
    }),
    getTravels: (function(count) {
      let travels = [];
      let t = makeTravel();
      while (t) {
        travels.push(t);
        if (count && travels.length>=count) break;
        t = makeTravel();
      }
      return separateTravels(travels);
    })
  };

  // ------------------------------------------------------------------------------------------------------------------
  // Random numbers
  // ------------------------------------------------------------------------------------------------------------------

  // random integer number between min (incl.) and max (incl).
  function random(min, max) {
    //var rnd = Math.random();

    seed = (seed * 9301 + 49297) % 233280;
    var rnd = seed / 233280;

    return Math.floor(rnd * (max+1 - min)) + min;
  }

  function pseudoUuid() {
    let s = '';
    for (let i=0; i<16; ++i) {
      s += random(0, 255).toString(16);
    }
    return s;
  }

  // ------------------------------------------------------------------------------------------------------------------
  // Flights
  // ------------------------------------------------------------------------------------------------------------------

  function makeFlights() {
    for (let conn of connections) {
      let dates = genFlightDates(conn.weekday);
      for (let d of dates) {
        let flight_info = flightInfo(conn);  // uses random
        let [carrier] = carriers.filter(carr => carr.AirlineID == conn.AirlineID);
        flights.push({
          AirlineID:    conn.AirlineID,
          ConnectionID: conn.ConnectionID,
          distance: conn.distance,
          FlightDate: d,
          CurrencyCode_code: carrier ? carrier.CurrencyCode_code : 'EUR',
          Price:          flight_info.Price,
          PlaneType:      flight_info.id,
          MaximumSeats:   flight_info.MaximumSeats,
          OccupiedSeats: flight_info.seats_occ,
          seats_to_book:  flight_info.seats_occ  // will be changed during generation of bookings
        });
      }
    }
    flights.sort(byDate);

    function byDate(fa, fb) {
      if (fa.FlightDate < fb.FlightDate) { return -1; }
      if (fa.FlightDate > fb.FlightDate) { return 1; }
      return 0;
    }
  }

  // Returns an array of dates, at which the connection is operated.
  // In contrast to real flight plans, here each connection is only operated on a certain weekday.
  // Generation logic:
  //   if the connection operates on a Wednesday, then the first date is the Wednesday 31 weeks from now
  //   then subtract "flightInterval" days
  function genFlightDates(weekday) {
    // wwekday   : integer 1=Monday ... 7=Sunday (from connection table)
    // getDate() : integer 1..31, day of month
    // getDay()  : integer 0..6 = Sunday..Saturday
    // "add days": make sure to call getDate() and setDate() on the same object!

    // weeks
    const flightInterval = 43;         // ABAP: 1, 2, 4, 8, 43
    const back           = 21;
    const forw           = 31;

    var nextMonday = new Date();
    nextMonday.setDate(nextMonday.getDate() + (1 + 7 - nextMonday.getDay()) % 7);
    var minDate = new Date(nextMonday);
    minDate.setDate(minDate.getDate() - (back*7+1) );  // is a Sunday           21
    var maxDate = new Date(nextMonday);
    maxDate.setDate(maxDate.getDate() + forw*7);  // is a Monday                31

    var flightdate = new Date(maxDate);
    flightdate.setDate(flightdate.getDate() + weekday - 1) // -1 because Monday=1 in connection table

    var dates = [];
    while (flightdate>minDate) {
      dates.push(flightdate.toISOString().slice(0,10));
      flightdate.setDate(flightdate.getDate() - flightInterval*7)
    }
    return dates;
  }

  function flightInfo(conn) {
    // get a suitable plane type
    let planes = (conn.distance > 3000) ? plane_types.long_distance : plane_types.short_distance;
    let plane = ran.entryOf(planes);
    let seatsOccPerc = random(70-25, 70+25);
    return {
      id: plane.id,
      MaximumSeats: plane.MaximumSeats,
      seats_occ: Math.floor(plane.MaximumSeats * seatsOccPerc / 100),
      Price: flightPrice(seatsOccPerc, conn.distance)
    }
  }

  function flightPrice(seatsOccPerc, distance) {
    var p = 25 + ( 3 * Math.pow(seatsOccPerc, 2) / 400 );
    return Math.floor( p * distance / 100 );
  }


  // ------------------------------------------------------------------------------------------------------------------
  // Travels
  // ------------------------------------------------------------------------------------------------------------------

  function makeTravel() {
    var travel = null;

    var tUuid = makeUUID();

    var bookings = makeBookings(g_travelId, tUuid);
    if (bookings.length > 0) {
      // travel create day is 15 days before today or first flight booking (whatever comes first)
      // createdAt:     travelCreateDay + random time
      // lastChangedAt: travelCreateDay + ran.travelChangeDate + random time
      // both have format 2020-11-10T03:54:50Z
      var bookingDate = new Date(bookings[0].BookingDate);
      var today = new Date();
      today.setUTCHours(0, 0, 0, 0);
      var travelCreateDay = (bookingDate < today) ? bookingDate : today;
      travelCreateDay.setDate(travelCreateDay.getDate() - 15);
      var createdAt = new Date(travelCreateDay);
      createdAt.setSeconds(random(0, 24*60*60-1));
      createdAt = createdAt.toISOString().slice(0, 19)+'Z';
      var lastChangedAt = new Date(travelCreateDay);
      lastChangedAt.setDate(lastChangedAt.getDate() + ran.travelChangeDate());
      lastChangedAt.setSeconds(random(0, 24*60*60-1));
      lastChangedAt = lastChangedAt.toISOString().slice(0, 19)+'Z';

      // var createdAt = 0; //new Date(travelCreateDay);
      // var lastChangedAt = 0; //new Date(travelCreateDay);

      var travelStatus = ran.entryOf(['O', 'O', 'O', 'A', 'A', 'X' ]);
      var bookingStatus = (travelStatus == 'A') ? 'B' : (travelStatus == 'O') ? 'N' : 'X';

      for (let b of bookings) {
        b.BookingStatus_code = bookingStatus;
        b.LastChangedAt = lastChangedAt;
        for (let s of b.booking_supplements) {
          s.LastChangedAt = lastChangedAt;
        }
      }

      travel = {
        TravelUUID: tUuid,
        TravelID: g_travelId,
        to_Agency_AgencyID: ran.entryOf(agencies).AgencyID,
        to_Customer_CustomerID: (random(1, 4) == 1) ? ran.entryOf(passengers).CustomerID : bookings[0].to_Customer_CustomerID,
        BeginDate: bookings[0].FlightDate,
        EndDate: bookings[bookings.length-1].FlightDate,
        BookingFee: 10 * bookings.length,
        TotalPrice: 10 * bookings.length + bookings.reduce((sum,book) => sum+book.FlightPrice+book.booking_supplements.reduce((sum,suppl) => sum+suppl.Price, 0), 0),
        CurrencyCode_code: bookings[0].CurrencyCode_code,
        Description: getDescription(bookings),
        TravelStatus_code: travelStatus,
        createdBy: ran.entryOf(lastNames).last_name,
        createdAt: createdAt,
        LastChangedBy: ran.entryOf(lastNames).last_name,
        LastChangedAt: lastChangedAt,
        bookings: bookings
      };
      g_travelId++;
    }
    return travel;
  }

  function getDescription(bookings) {
    var c = random(0, 9);
    switch (c) {
      case 1:
      case 2:
        var custSet = new Set(bookings.map(x => x.to_Customer_CustomerID));
        var pass = [...custSet].map(x => passengers.find(y => y.CustomerID == x).first_name);
        return (c==1 ? 'Business Trip' : 'Vacation') + ' for ' + pass.join(', ');
      case 3:
      case 4:
        var conn = connections.find(conn => conn.AirlineID == bookings[0].to_Carrier_AirlineID && conn.ConnectionID == bookings[0].ConnectionID);
        var airport = airports.find(x => x.airport_id == conn.airport_to_id);
        var country = countries.find(x => x.code == airport.country);
        return (c==3 ? 'Business Trip' : 'Vacation') + ' to ' + (country ? country.name : 'Mars');
      case 5:
        conn = connections.find(carr => carr.AirlineID == bookings[0].to_Carrier_AirlineID && carr.ConnectionID == bookings[0].ConnectionID);
        airport = airports.find(x => x.airport_id == conn.airport_to_id);
        return 'Vacation to ' + airport.city;
      default:
        return 'Vacation';
    };
  }


  // ------------------------------------------------------------------------------------------------------------------
  // Bookings + BookingSupplements
  // ------------------------------------------------------------------------------------------------------------------

  function makeBookings(tId, tUuid) {
    // helper to add number of days to a dateString like '2021-04-19'
    function addDays(dateString, days) {
      var date = new Date(dateString);
      date.setDate(date.getDate() + days);
      return date.toISOString().slice(0,10);
    }

    function findSuitableFlight(seatsRequired, prevFlight) {
      // suitable: - seats_to_book >= seatsRequired
      //           - if prevFlight is set: departure airport = destination airport of prevFlight
      var suitableFlights = flights.filter(x => x.seats_to_book >= seatsRequired);
      if (prevFlight) {
        var prevConn = connections.find(conn => conn.AirlineID == prevFlight.AirlineID && conn.ConnectionID == prevFlight.ConnectionID);
        if (!prevConn) return null;
        var conn = connections.find(conn => conn.airport_from_id == prevConn.airport_to_id);
        if (!conn) return null;
        suitableFlights = suitableFlights.filter(f => f.ConnectionID == conn.ConnectionID && f.FlightDate >= prevFlight.FlightDate);
      }
      return suitableFlights[0];
    }
    // function findSuitableFlight(seatsRequired, prevFlight) {
    //   var suitableFlights = flights.filter(x => x.seats_to_book >= seatsRequired);
    //   return ran.entryOf(suitableFlights);
    // }

    var groupSize = ran.groupSize();
    var tripLength = ran.tripLength();

    var group = new Set();  // avoid duplicates
    while (group.size < groupSize) {
      group.add(ran.entryOf(passengers).CustomerID);
    }

    let bookings = [];
    var bId = 0;

    var flight = findSuitableFlight(groupSize);
    for (let c=0; c<tripLength && flight; c++) {
      var bookingDate = addDays(flight.FlightDate, -ran.bookingDateOffset());
      var seatsOccPerc = (flight.OccupiedSeats - flight.seats_to_book) * 100 / flight.MaximumSeats;

      flight.seats_to_book -= groupSize;
      if (flight.seats_to_book < 0) flight.seats_to_book = 0;

      for (let custId of [...group]) {
        bId++;

        var bUuid = makeUUID();

        bookings.push({
          TravelID: tId,
          to_Travel_TravelUUID: tUuid,
          BookingID: bId,
          BookingUUID: bUuid,
          BookingDate: bookingDate,
          to_Customer_CustomerID: custId,
          to_Carrier_AirlineID: flight.AirlineID,
          ConnectionID: flight.ConnectionID,
          FlightDate: flight.FlightDate,
          FlightPrice: flightPrice(seatsOccPerc, flight.distance),
          CurrencyCode_code: flight.CurrencyCode_code,
          booking_supplements: bookingSupplements(tId, bId, tUuid, bUuid)
        });
      }
      flight = findSuitableFlight(groupSize, flight);
    }

    return bookings;
  }

  function bookingSupplements(tId, bId, tUuid, bUuid) {
    var bookingSupplements = [];
    var sc = ran.supplementCount();
    for (let i=1; i<=sc; i++) {
      var suppl = ran.entryOf(supplements);
      bookingSupplements.push({
        TravelID: tId,
        to_Travel_TravelUUID: tUuid,
        //bookingId: bId,
        to_Booking_BookingUUID: bUuid,
        BookingSupplementID: i,

        BookSupplUUID: makeUUID(),

        to_Supplement_SupplementID: suppl.SupplementID,
        Price: parseFloat(suppl.Price),
        CurrencyCode_code: suppl.CurrencyCode_code
      });
    }
    return bookingSupplements;
  }
}

//---------------------------------------------------------------------------------------------------------------------
//
//---------------------------------------------------------------------------------------------------------------------

module.exports = {
  getGenerator
};
