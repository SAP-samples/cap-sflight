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

annotate TravelService.Travel with @(Common.SideEffects: {
  SourceProperties: [BookingFee],
  TargetProperties: ['TotalPrice']
}){
  BookingFee  @Common.FieldControl  : TravelStatus.fieldControl;
  BeginDate   @Common.FieldControl  : TravelStatus.fieldControl;
  EndDate     @Common.FieldControl  : TravelStatus.fieldControl;
  to_Agency   @Common.FieldControl  : TravelStatus.fieldControl;
  to_Customer @Common.FieldControl  : TravelStatus.fieldControl;

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

annotate TravelService.Booking with @UI.CreateHidden : to_Travel.TravelStatus.createDeleteHidden;
annotate TravelService.Booking with @UI.DeleteHidden : to_Travel.TravelStatus.createDeleteHidden;

annotate TravelService.Booking {
  BookingDate   @Core.Computed;
  ConnectionID  @Common.FieldControl  : to_Travel.TravelStatus.fieldControl;
  FlightDate    @Common.FieldControl  : to_Travel.TravelStatus.fieldControl;
  FlightPrice   @Common.FieldControl  : to_Travel.TravelStatus.fieldControl;
  BookingStatus @Common.FieldControl  : to_Travel.TravelStatus.fieldControl;
  to_Carrier    @Common.FieldControl  : to_Travel.TravelStatus.fieldControl;
  to_Customer   @Common.FieldControl  : to_Travel.TravelStatus.fieldControl;
};

annotate TravelService.Booking with @(
  Capabilities.NavigationRestrictions : {
    RestrictedProperties : [
      {
        NavigationProperty : to_BookSupplement,
        InsertRestrictions : {
          Insertable : to_Travel.TravelStatus.insertDeleteRestriction
        },
        DeleteRestrictions : {
          Deletable : to_Travel.TravelStatus.insertDeleteRestriction
        }
      }
    ]
  }
);


annotate TravelService.BookingSupplement {
  Price         @Common.FieldControl  : to_Travel.TravelStatus.fieldControl;
  to_Supplement @Common.FieldControl  : to_Travel.TravelStatus.fieldControl;
  to_Booking    @Common.FieldControl  : to_Travel.TravelStatus.fieldControl;
  to_Travel     @Common.FieldControl  : to_Travel.TravelStatus.fieldControl;

};

annotate Currency with @Common.UnitSpecificScale : Decimals;
