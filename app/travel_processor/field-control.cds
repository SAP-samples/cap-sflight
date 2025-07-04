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
  }
}){
  BookingFee  @Common.FieldControl  : TravelStatus.fieldControl;
  BeginDate   @Common.FieldControl  : TravelStatus.fieldControl;
  EndDate     @Common.FieldControl  : TravelStatus.fieldControl;
  to_Agency   @Common.FieldControl  : TravelStatus.fieldControl;
  to_Customer @Common.FieldControl  : TravelStatus.fieldControl;

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
        SourceEntities : [
            to_Booking
        ],
       TargetProperties : ['TotalPrice'
       ]
    }
);

annotate TravelService.Booking with @UI.CreateHidden : (to_Travel.TravelStatus.code != #Open);
annotate TravelService.Booking with @UI.DeleteHidden : (to_Travel.TravelStatus.code != #Open);

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
  Price         @Common.FieldControl  : to_Travel.TravelStatus.fieldControl;
  to_Supplement @Common.FieldControl  : to_Travel.TravelStatus.fieldControl;
  to_Booking    @Common.FieldControl  : to_Travel.TravelStatus.fieldControl;
  to_Travel     @Common.FieldControl  : to_Travel.TravelStatus.fieldControl;
};
