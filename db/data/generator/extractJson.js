'use strict';

// read csv, convert to json, write to file
// only extract those columns that are actually needed by the data generator

const fs = require('fs')

const path_csv = '../';
const path_json = './';

const config = {
  customer: {
    csv_file: 'sap.fe.cap.travel-Passenger.csv',
    json_file: 'customer.json',
    mapper: (line) => {
      var o = {};
      [ o.customer_id, o.first_name, 
        //o.last_name, o.title, o.street,
        //o.postal_code, o.city, o.country_code, o.phone_number, o.email_address 
      ] = line.split(';');
      return o;
    }
  },
  supplement : {
    csv_file: 'sap.fe.cap.travel-Supplement.csv',
    json_file: 'supplement.json',
    mapper: (line) => {
      // SupplementID;Price;Type_code;Description;CurrencyCode_code
      var o = {};
      [ o.supplement_id, o.price, o.supplement_category, o.description, o.currency_code ] = line.split(';');
      return o;
    }
  },
  countries: {
    csv_file: 'sap.common-Countries.csv',
    json_file: 'countries.json',
    mapper: (line) => {
      // code;name;descr
      var o = {};
      [ o.code, o.name, o.descr ] = line.split(';');
      return o;
    }
  },
  agencies: {
    csv_file: 'sap.fe.cap.travel-TravelAgency.csv',
    json_file: 'agencies.json',
    mapper: (line) => {
      // AgencyID;Name;Street;PostalCode;City;CountryCode_code;PhoneNumber;EMailAddress;WebAddress
      var o = {};     
      [ o.agency_id ] = line.split(';');
      return o;
    }
  },
  airports: {
    csv_file: 'sap.fe.cap.travel-Airport.csv',
    json_file: 'airports.json',
    mapper: (line) => {
      // AirportID;Name;City;CountryCode_code
      var o = {};     
      [ o.airport_id, o.name, o.city, o.country ] = line.split(';');
      return o;
    }
  }
};

for (let w of [
//    'customer',
//    'supplement',
//    'countries'
//     'agencies'
      'airports'
  ]) {
  let t = config[w];
  try {
    let data = fs.readFileSync(path_csv + t.csv_file, 'utf8')
    let j = data.split(/\r?\n/).filter(x => x.includes(';')).slice(1).map(t.mapper);  // slice: remove header line
    //console.log(JSON.stringify(j, null, 2))
    fs.writeFileSync(path_json + t.json_file, JSON.stringify(j, null, 2));
  } catch (err) {
    console.error(err)
  }
}
