using { sap.fe.cap.travel as my } from './schema';

annotate my.Travel with {
  @mandatory BeginDate;
  @mandatory EndDate;
  @mandatory to_Agency;
  @mandatory to_Customer;
}

annotate my.Booking with {
  @mandatory ConnectionID;
  @mandatory FlightDate;
  @mandatory FlightPrice;
  @mandatory BookingStatus;
  @mandatory to_Carrier;
  @mandatory to_Customer;
  @mandatory to_Travel;
  @mandatory to_Flight;
}

annotate my.BookingSupplement with {
  @mandatory Price;
  @mandatory to_Supplement;
}


annotate my.Travel with @Capabilities.FilterRestrictions.FilterExpressionRestrictions: [
  { Property: 'BeginDate', AllowedExpressions : 'SingleRange' },
  { Property: 'EndDate', AllowedExpressions : 'SingleRange' }
];
