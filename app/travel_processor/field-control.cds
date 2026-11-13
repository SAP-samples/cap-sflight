using TravelService from '../../srv/travel-service';

//
// annotations that control the behavior of fields and actions
//


using { sap.fe.cap.travel.TravelStatus } from '../../db/schema';

// As we use field control based on travel status for many elements, we do the computation in a calculated element
// right here instead of repeating the same expression in multiple annotations
extend TravelStatus with {  
  // can't use UInt8 (which would automatically be mapped to Edm.Byte) because it's not supported on H2
  fieldControl: Int16 @odata.Type:'Edm.Byte' enum {Inapplicable = 0; ReadOnly = 1; Optional = 3; Mandatory = 7;}
    = (code = #Accepted ? #ReadOnly : #Mandatory );
}


annotate TravelService.Travel with @(Common : {
  SideEffects: {
    SourceProperties: [BookingFee],
    TargetProperties: ['TotalPrice', 'GreenFee', 'TreesPlanted']
  },
  SideEffects #GoGreen:{
    SourceProperties: [GoGreen],
    TargetProperties: ['TotalPrice', 'GreenFee', 'TreesPlanted']
  },
  SideEffects #Exp:{
    SourceProperties: [field_BCtr, field_BCtrCalc],
    TargetProperties: ['field_B']
  }
}){
  BookingFee    @Common.FieldControl  : TravelStatus_ctrl;
  BeginDate     @Common.FieldControl  : TravelStatus_ctrl;
  EndDate       @Common.FieldControl  : TravelStatus_ctrl;
  to_Agency     @Common.FieldControl  : TravelStatus_ctrl;
  to_Customer   @Common.FieldControl  : TravelStatus_ctrl;

  // field_A @Common.FieldControl: (field_ACtr = 'readonly' ? 1 : (field_ACtr = 'inapplicable' ? 0 : (field_ACtr = 'mandatory' ? 7 : 3)))
  //         @readonly:  (field_ACtr = 'readonly')
  //         @mandatory: (field_ACtr = 'mandatory')
  //         @enabled:   (field_ACtr != 'inapplicable');
  field_A @Common.FieldControl: (field_ACtr = 'readonly' and to_Agency.City = 'Sydney' ? 1 : 3);
  field_B @Common.FieldControl: field_BCtrCalc;

} actions {
  rejectTravel @(
    Core.OperationAvailable : ($self.TravelStatus.code != #Canceled),
    Common.SideEffects.TargetProperties : ['in/TravelStatus_code'],
  );
  acceptTravel @(
    Core.OperationAvailable : ($self.TravelStatus.code != #Accepted),
    Common.SideEffects.TargetProperties : ['in/TravelStatus_code'],
  );
  deductDiscount @(
    Core.OperationAvailable : ($self.TravelStatus.code = #Open),
    Common.SideEffects.TargetProperties : ['in/TotalPrice', 'in/BookingFee'],
  );
}

annotate TravelService.Travel @(
  Common.SideEffects#ReactonItemCreationOrDeletion : {
    SourceEntities : [to_Booking],
    TargetProperties : ['TotalPrice']
  }
);

annotate TravelService.Booking with @UI.CreateHidden : (to_Travel.TravelStatus.code != #Open);
annotate TravelService.Booking with @UI.DeleteHidden : (to_Travel.TravelStatus.code != #Open);

// ok
// annotate TravelService.Booking with @UI.CreateHidden : (not to_Travel.TravelStatus.createDeleteHidden);
// annotate TravelService.Booking with @UI.DeleteHidden : (not to_Travel.TravelStatus.createDeleteHidden);

// ok
// annotate TravelService.Booking with @UI.CreateHidden : { $edmJson: { $Path: 'to_Travel/TravelStatus/createDeleteHidden'} };
// annotate TravelService.Booking with @UI.DeleteHidden : { $edmJson: { $Path: 'to_Travel/TravelStatus/createDeleteHidden'} };

// ok
// annotate TravelService.Booking with @UI.CreateHidden : { $edmJson: {$Not: { $Path: 'to_Travel/TravelStatus/createDeleteHidden'} } };
// annotate TravelService.Booking with @UI.DeleteHidden : { $edmJson: {$Not: { $Path: 'to_Travel/TravelStatus/createDeleteHidden'} } };


// code;createDeleteHidden;insertDeleteRestriction
// O;   false;             true
// A;   true;              false
// X;   true;              false


annotate TravelService.Booking {
  BookingDate   @Core.Computed;
  ConnectionID  @Common.FieldControl  : to_Travel.TravelStatus_ctrl;
  FlightDate    @Common.FieldControl  : to_Travel.TravelStatus_ctrl;
  FlightPrice   @Common.FieldControl  : to_Travel.TravelStatus_ctrl;
  BookingStatus @Common.FieldControl  : to_Travel.TravelStatus_ctrl;
  to_Carrier    @Common.FieldControl  : to_Travel.TravelStatus_ctrl;
  to_Customer   @Common.FieldControl  : to_Travel.TravelStatus_ctrl;
};

annotate TravelService.Booking with @(
  Capabilities.NavigationRestrictions : {
    RestrictedProperties : [
      {
        NavigationProperty : to_BookSupplement,
        InsertRestrictions : {
          Insertable : (to_Travel.TravelStatus.code = #Open)
        },
        DeleteRestrictions : {
          Deletable : (to_Travel.TravelStatus.code = #Open)
        }
      }
    ]
  }
);


annotate TravelService.BookingSupplement {
  Price          @Common.FieldControl  : to_Travel.TravelStatus_ctrl;
  to_Supplement  @Common.FieldControl  : to_Travel.TravelStatus_ctrl;
  to_Booking     @Common.FieldControl  : to_Travel.TravelStatus_ctrl;
  to_Travel      @Common.FieldControl  : to_Travel.TravelStatus_ctrl;
};
