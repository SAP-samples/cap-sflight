using TravelService from '../../srv/travel-service';

//
// annotations that control the behavior of fields and actions
//

// Workarounds for overly strict OData libs and clients
annotate cds.UUID with @Core.Computed  @odata.Type : 'Edm.String';

// Add fields to control enablement of action buttons on UI
extend projection TravelService.Travel with {
  // REVISIT: shall be improved by omitting "null as"
  virtual null as acceptEnabled         : Boolean @UI.Hidden,
  virtual null as rejectEnabled         : Boolean @UI.Hidden,
  virtual null as deductDiscountEnabled : Boolean @UI.Hidden,
}

annotate TravelService.Travel {
  //TravelStatus  @mandatory;
  //BookingFee    @mandatory;
  BeginDate       @mandatory;
  EndDate         @mandatory;
  to_Agency       @mandatory;
  to_Customer     @mandatory;
} actions {
  rejectTravel @(
    Core.OperationAvailable : in.rejectEnabled,
    Common.SideEffects.TargetProperties : [
      'in/TravelStatus_code',
      'in/acceptEnabled',
      'in/rejectEnabled'
    ],
  );
  acceptTravel @(
    Core.OperationAvailable : in.acceptEnabled,
    Common.SideEffects.TargetProperties : [
      'in/TravelStatus_code',
      'in/acceptEnabled',
      'in/rejectEnabled'
    ],
  );
  deductDiscount @(
    Core.OperationAvailable : in.deductDiscountEnabled,
    Common.SideEffects.TargetProperties : ['in/deductDiscountEnabled'],
  );
}

annotate TravelService.Booking {
  BookingDate   @Core.Computed;
  ConnectionID  @mandatory;
  FlightDate    @mandatory;
  BookingStatus @mandatory;
  to_Carrier    @mandatory;
  to_Customer   @mandatory;
};

annotate TravelService.BookingSupplement {
  Price         @mandatory;
  to_Supplement @mandatory;
};

annotate Currency with @Common.UnitSpecificScale : Decimals;
