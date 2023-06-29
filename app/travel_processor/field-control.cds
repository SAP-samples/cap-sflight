using TravelService from '../../srv/travel-service';

//
// annotations that control the behavior of fields and actions
//

annotate TravelService.Travel with @(Common.SideEffects: {
  SourceProperties: [BookingFee],
  TargetProperties: ['TotalPrice']
}){
  BookingFee  @Common.FieldControl  : TravelStatus.fieldControl;
  BeginDate   @Common.FieldControl  : TravelStatus.fieldControl;
  EndDate     @Common.FieldControl  : TravelStatus.fieldControl;
  Agency      @Common.FieldControl  : TravelStatus.fieldControl;
  Customer    @Common.FieldControl  : TravelStatus.fieldControl;

} actions {
  rejectTravel @(
    Core.OperationAvailable : { $edmJson: { $Ne: [{ $Path: 'in/TravelStatus_code'}, 'X']}},
    Common.SideEffects.TargetProperties : ['in/TravelStatus_code'],
  );
  acceptTravel @(
    Core.OperationAvailable : { $edmJson: { $Ne: [{ $Path: 'in/TravelStatus_code'}, 'A']}},
    Common.SideEffects.TargetProperties : ['in/TravelStatus_code'],
  );
  deductDiscount @(
    Core.OperationAvailable : { $edmJson: { $Eq: [{ $Path: 'in/TravelStatus_code'}, 'O']}}
  );
}

annotate TravelService.Travel @(
    Common.SideEffects#ReactonItemCreationOrDeletion : {
        SourceEntities : [
            Bookings
        ],
       TargetProperties : [
           'TotalPrice'
       ]
    }
);

annotate TravelService.Booking with @UI.CreateHidden : Travel.TravelStatus.createDeleteHidden;
annotate TravelService.Booking with @UI.DeleteHidden : Travel.TravelStatus.createDeleteHidden;

annotate TravelService.Booking {
  BookingDate   @Core.Computed;
  ConnectionID  @Common.FieldControl  : Travel.TravelStatus.fieldControl;
  FlightDate    @Common.FieldControl  : Travel.TravelStatus.fieldControl;
  FlightPrice   @Common.FieldControl  : Travel.TravelStatus.fieldControl;
  BookingStatus @Common.FieldControl  : Travel.TravelStatus.fieldControl;
  Carrier       @Common.FieldControl  : Travel.TravelStatus.fieldControl;
  Customer      @Common.FieldControl  : Travel.TravelStatus.fieldControl;
};

annotate TravelService.Booking with @(
  Capabilities.NavigationRestrictions : {
    RestrictedProperties : [
      {
        NavigationProperty : BookSupplements,
        InsertRestrictions : {
          Insertable : Travel.TravelStatus.insertDeleteRestriction
        },
        DeleteRestrictions : {
          Deletable : Travel.TravelStatus.insertDeleteRestriction
        }
      }
    ]
  }
);


annotate TravelService.BookingSupplement {
  Price         @Common.FieldControl  : Travel.TravelStatus.fieldControl;
  Supplement    @Common.FieldControl  : Travel.TravelStatus.fieldControl;
  Booking       @Common.FieldControl  : Travel.TravelStatus.fieldControl;
  Travel        @Common.FieldControl  : Travel.TravelStatus.fieldControl;

};
