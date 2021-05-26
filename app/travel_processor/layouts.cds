using TravelService from '../../srv/travel-service';

//
// annotatios that control the fiori layout
//

annotate TravelService.Travel with @UI : {
  Identification : [
    { $Type  : 'UI.DataFieldForAction', Action : 'TravelService.acceptTravel',   Label  : '{i18n>AcceptTravel}'   },
    { $Type  : 'UI.DataFieldForAction', Action : 'TravelService.rejectTravel',   Label  : '{i18n>RejectTravel}'   },
    { $Type  : 'UI.DataFieldForAction', Action : 'TravelService.deductDiscount', Label  : '{i18n>DeductDiscount}' }
  ],
  HeaderInfo : {
    TypeName       : '{i18n>Travel}',
    TypeNamePlural : '{i18n>Travels}',
    Title          : { Value : TravelID }
  },
  PresentationVariant : {
    Text           : 'Default',
    Visualizations : ['@UI.LineItem'],
    SortOrder      : [{
      $Type      : 'Common.SortOrderType',
      Property   : TravelID,
      Descending : true
    }]
  },
  SelectionFields : [
    TravelID,
    to_Agency_AgencyID,
    to_Customer_CustomerID,
    TravelStatus_code
  ],
  LineItem : [
    { $Type  : 'UI.DataFieldForAction', Action : 'TravelService.acceptTravel',   Label  : '{i18n>AcceptTravel}'   },
    { $Type  : 'UI.DataFieldForAction', Action : 'TravelService.rejectTravel',   Label  : '{i18n>RejectTravel}'   },
    { $Type  : 'UI.DataFieldForAction', Action : 'TravelService.deductDiscount', Label  : '{i18n>DeductDiscount}' },
    { Value : TravelID               },
    { Value : to_Agency_AgencyID     },
    { Value : to_Customer_CustomerID },
    { Value : BeginDate              },
    { Value : EndDate                },
    { Value : BookingFee             },
    { Value : TotalPrice             },
    { Value : Description            },
    { Value : TravelStatus_code      }
  ],
  Facets : [{
    $Type  : 'UI.CollectionFacet',
    Label  : '{i18n>Travel}',
    ID     : 'Travel',
    Facets : [{  // travel details
      $Type  : 'UI.ReferenceFacet',
      ID     : 'TravelData',
      Target : '@UI.FieldGroup#TravelData',
      Label  : '{i18n>Travel}'
    }]
  }, {  // booking list
    $Type  : 'UI.ReferenceFacet',
    Target : 'to_Booking/@UI.LineItem',
    Label  : '{i18n>Booking}'
  }],
  FieldGroup#TravelData : { Data : [
    { Value : TravelID               },
    { Value : to_Agency_AgencyID     },
    { Value : to_Customer_CustomerID },
    { Value : BeginDate              },
    { Value : EndDate                },
    { Value : BookingFee             },
    { Value : TotalPrice             },
    { Value : Description            },
    { Value : TravelStatus_code, Label : '{i18n>Status}' }  // label only necessary if differs from title of element
  ]},
};

annotate TravelService.Booking with @UI : {
  Identification : [
    { Value : BookingID },
  ],
  HeaderInfo : {
    TypeName       : '{i18n>Bookings}',
    TypeNamePlural : '{i18n>Bookings}',
    Title          : { Value : BookingID }
  },
  PresentationVariant : {
    Text           : 'Default',
    Visualizations : ['@UI.LineItem']
  },
  SelectionFields : [],
  LineItem : [
    { Value : BookingID,             Label : '{i18n>BookingNumber}' },
    { Value : BookingDate            },
    { Value : to_Customer_CustomerID },
    { Value : to_Carrier_AirlineID   },
    { Value : ConnectionID,          Label : '{i18n>FlightNumber}' },
    { Value : FlightDate             },
    { Value : FlightPrice            },
    { Value : BookingStatus_code     }
  ],
  Facets : [{
    $Type  : 'UI.CollectionFacet',
    Label  : '{i18n>Booking}',
    ID     : 'Booking',
    Facets : [{  // booking details
      $Type  : 'UI.ReferenceFacet',
      ID     : 'BookingData',
      Target : '@UI.FieldGroup#BookingData',
      Label  : 'Booking'
    }]
  }, {  // supplements list
    $Type  : 'UI.ReferenceFacet',
    Target : 'to_BookSupplement/@UI.LineItem',
    Label  : '{i18n>BookingSupplement}'
  }],
  FieldGroup #BookingData : { Data : [
    { Value : BookingID              },
    { Value : BookingDate,           },
    { Value : to_Customer_CustomerID },
    { Value : to_Carrier_AirlineID   },
    { Value : ConnectionID           },
    { Value : FlightDate             },
    { Value : FlightPrice            },
    { Value : BookingStatus_code     }
  ]},
};

annotate TravelService.BookingSupplement with @UI : {
  Identification : [
    { Value : BookingSupplementID }
  ],
  HeaderInfo : {
    TypeName       : '{i18n>BookingSupplement}',
    TypeNamePlural : '{i18n>BookingSupplements}',
    Title          : { Value : BookingSupplementID },
    Description    : { Value : BookingSupplementID }
  },
  LineItem : [
    { Value : BookingSupplementID                                       },
    { Value : to_Supplement_SupplementID, Label : '{i18n>ProductID}'    },
    { Value : Price,                      Label : '{i18n>ProductPrice}' }
  ],
};
