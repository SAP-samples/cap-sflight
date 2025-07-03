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
  BookingFee  @mandatory: (TravelStatus.code != #Accepted) @readonly: (TravelStatus.code = #Accepted);
  BeginDate   @mandatory: (TravelStatus.code != #Accepted) @readonly: (TravelStatus.code = #Accepted);
  EndDate     @mandatory: (TravelStatus.code != #Accepted) @readonly: (TravelStatus.code = #Accepted);
  to_Agency   @mandatory: (TravelStatus.code != #Accepted) @readonly: (TravelStatus.code = #Accepted);
  to_Customer @mandatory: (TravelStatus.code != #Accepted) @readonly: (TravelStatus.code = #Accepted);

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
  ConnectionID  @mandatory: (to_Travel.TravelStatus.code != #Accepted) @readonly: (to_Travel.TravelStatus.code = #Accepted);
  FlightDate    @mandatory: (to_Travel.TravelStatus.code != #Accepted) @readonly: (to_Travel.TravelStatus.code = #Accepted);
  FlightPrice   @mandatory: (to_Travel.TravelStatus.code != #Accepted) @readonly: (to_Travel.TravelStatus.code = #Accepted);
  BookingStatus @mandatory: (to_Travel.TravelStatus.code != #Accepted) @readonly: (to_Travel.TravelStatus.code = #Accepted);
  to_Carrier    @mandatory: (to_Travel.TravelStatus.code != #Accepted) @readonly: (to_Travel.TravelStatus.code = #Accepted);
  to_Customer   @mandatory: (to_Travel.TravelStatus.code != #Accepted) @readonly: (to_Travel.TravelStatus.code = #Accepted);
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
  Price         @mandatory: (to_Travel.TravelStatus.code != #Accepted) @readonly: (to_Travel.TravelStatus.code = #Accepted);
  to_Supplement @mandatory: (to_Travel.TravelStatus.code != #Accepted) @readonly: (to_Travel.TravelStatus.code = #Accepted);
  to_Booking    @mandatory: (to_Travel.TravelStatus.code != #Accepted) @readonly: (to_Travel.TravelStatus.code = #Accepted);
  to_Travel     @mandatory: (to_Travel.TravelStatus.code != #Accepted) @readonly: (to_Travel.TravelStatus.code = #Accepted);
};
