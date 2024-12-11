
using { sap.fe.cap.travel as my } from '../db/schema';
namespace sap.fe.cap.travel;

entity TravelAnalytics as projection on my.Travel {
  *, TreesPlanted @(AnalyticsDetails.measureType: #BASE)
};

annotate my.TravelAnalytics with @ObjectModel.supportedCapabilities: [
  #ANALYTICAL_PROVIDER
];

annotate my.TravelStatus with @ObjectModel.supportedCapabilities: [
  #ANALYTICAL_DIMENSION
];

annotate my.TravelAgency with @ObjectModel.supportedCapabilities: [
  #ANALYTICAL_DIMENSION
];

annotate my.Travel with @ObjectModel.supportedCapabilities: [
  #ANALYTICAL_FACT
]{
  BookingFee   @Aggregation.default: #SUM;
  TotalPrice   @Aggregation.default: #SUM;
  GreenFee     @Aggregation.default: #SUM;
  TreesPlanted @Aggregation.default: #SUM;
};

annotate my.Travel with {
  BookingFee   @Semantics.amount.CurrencyCode: Currency;
  TotalPrice   @Semantics.amount.CurrencyCode: Currency;
  GreenFee     @Semantics.amount.CurrencyCode: Currency;
};
