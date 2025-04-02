using TravelService from '../../srv/travel-service';

//
// annotations that control the behavior of fields and actions
//

annotate TravelService.Travel with @(Common : {
  SideEffects: {
    SourceProperties: [BookingFee],
    TargetProperties: ['TotalPrice', 'GreenFee', 'TreesPlanted']
  },
  SideEffects #GoGreen:{
    SourceProperties: [GoGreen],
    TargetProperties: ['TotalPrice', 'GreenFee', 'TreesPlanted']
  }
}){
  BookingFee             @Common.FieldControl  : TravelStatus_ctrl;
  BeginDate              @Common.FieldControl  : TravelStatus_ctrl;
  EndDate                @Common.FieldControl  : TravelStatus_ctrl;
  to_Agency_AgencyID     @Common.FieldControl  : TravelStatus_ctrl;
  to_Customer_CustomerID @Common.FieldControl  : TravelStatus_ctrl;

  field_A @Common.FieldControl: (field_Ctr = 'readonly' ? 1 : (field_Ctr = 'inapplicable' ? 0 : (field_Ctr = 'mandatory' ? 7 : 3)));

} actions {
  rejectTravel @(
    Core.OperationAvailable : ($self.TravelStatus_code != 'X'),
    Common.SideEffects.TargetProperties : ['in/TravelStatus_code'],
  );
  acceptTravel @(
    Core.OperationAvailable : ($self.TravelStatus_code != 'A'),
    Common.SideEffects.TargetProperties : ['in/TravelStatus_code'],
  );
  deductDiscount @(
    Core.OperationAvailable : ($self.TravelStatus_code = 'O'),
  );
}

annotate TravelService.Travel @(
  Common.SideEffects#ReactonItemCreationOrDeletion : {
    SourceEntities : [to_Booking],
    TargetProperties : ['TotalPrice']
  }
);

annotate TravelService.Booking with @UI.CreateHidden : ($self.to_Travel.TravelStatus_code != 'O');
annotate TravelService.Booking with @UI.DeleteHidden : ($self.to_Travel.TravelStatus_code != 'O');

// code;createDeleteHidden;insertDeleteRestriction
// O;   false;             true
// A;   true;              false
// X;   true;              false



annotate TravelService.Booking {
  BookingDate   @Core.Computed;
  ConnectionID            @Common.FieldControl  : to_Travel.TravelStatus_ctrl;
  FlightDate              @Common.FieldControl  : to_Travel.TravelStatus_ctrl;
  FlightPrice             @Common.FieldControl  : to_Travel.TravelStatus_ctrl;
  BookingStatus_code      @Common.FieldControl  : to_Travel.TravelStatus_ctrl;
  to_Carrier_AirlineID    @Common.FieldControl  : to_Travel.TravelStatus_ctrl;
  to_Customer_CustomerID  @Common.FieldControl  : to_Travel.TravelStatus_ctrl;
};

annotate TravelService.Booking with @(
  Capabilities.NavigationRestrictions : {
    RestrictedProperties : [
      {
        NavigationProperty : to_BookSupplement,
        InsertRestrictions : {
          Insertable : ($self.to_Travel.TravelStatus_code = 'O')
        },
        DeleteRestrictions : {
          Deletable : ($self.to_Travel.TravelStatus_code = 'O')
        }
      }
    ]
  }
);


annotate TravelService.BookingSupplement {
  Price                      @Common.FieldControl  : to_Travel.TravelStatus_ctrl;
  to_Supplement_SupplementID @Common.FieldControl  : to_Travel.TravelStatus_ctrl;
  to_Booking_BookingUUID     @Common.FieldControl  : to_Travel.TravelStatus_ctrl;
  to_Travel_TravelUUID       @Common.FieldControl  : to_Travel.TravelStatus_ctrl;

};
