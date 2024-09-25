using TravelService from '../../srv/travel-service';

//
// annotations that control the Fiori layout
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
    Title          : {
      $Type : 'UI.DataField',
      Value : Description
    },
    Description    : {
      $Type : 'UI.DataField',
      Value : TravelID
    }
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
    to_Agency_AgencyID,
    to_Customer_CustomerID,
    TravelStatus_code
  ],
  LineItem : [
    { $Type  : 'UI.DataFieldForAction', Action : 'TravelService.acceptTravel',   Label  : '{i18n>AcceptTravel}'   },
    { $Type  : 'UI.DataFieldForAction', Action : 'TravelService.rejectTravel',   Label  : '{i18n>RejectTravel}'   },
    { $Type  : 'UI.DataFieldForAction', Action : 'TravelService.deductDiscount', Label  : '{i18n>DeductDiscount}' },
    {
      Value : TravelID,
      @UI.Importance : #High
    },
    {
      Value : to_Agency_AgencyID,
      @HTML5.CssDefaults: {width:'16em'}
    },
    {
      Value : to_Customer_CustomerID,
      @UI.Importance : #High,
      @HTML5.CssDefaults: {width:'14em'}
    },
    { Value : BeginDate,  @HTML5.CssDefaults: {width:'9em'} },
    { Value : EndDate,    @HTML5.CssDefaults: {width:'9em'} },
    { Value : BookingFee, @HTML5.CssDefaults: {width:'10em'} },
    { Value : TotalPrice, @HTML5.CssDefaults: {width:'12em'} },
    {
      Value : TravelStatus_code,
      Criticality : { $edmJson: { $If: [{$Eq: [{ $Path: 'TravelStatus_code'}, 'O']}, 2,
                                { $If: [{$Eq: [{ $Path: 'TravelStatus_code'}, 'A']}, 3, 0] }] } },
      @UI.Importance : #High,
      @HTML5.CssDefaults: {width:'10em'}
    }
  ],
  Facets : [{
    $Type  : 'UI.CollectionFacet',
    Label  : '{i18n>GeneralInformation}',
    ID     : 'Travel',
    Facets : [
      {  // travel details
        $Type  : 'UI.ReferenceFacet',
        ID     : 'TravelData',
        Target : '@UI.FieldGroup#TravelData',
        Label  : '{i18n>GeneralInformation}'
      },
      {  // price information
        $Type  : 'UI.ReferenceFacet',
        ID     : 'PriceData',
        Target : '@UI.FieldGroup#PriceData',
        Label  : '{i18n>Prices}'
      },
      {  // date information
        $Type  : 'UI.ReferenceFacet',
        ID     : 'DateData',
        Target : '@UI.FieldGroup#DateData',
        Label  : '{i18n>Dates}'
      }
      ]
  }, {  // booking list
    $Type  : 'UI.ReferenceFacet',
    ID     : 'BookingList',
    Target : 'to_Booking/@UI.PresentationVariant',
    Label  : '{i18n>Bookings}'
  }],
  FieldGroup#TravelData : { Data : [
    { Value : TravelID               },
    { Value : to_Agency_AgencyID     },
    { Value : to_Customer_CustomerID },
    { Value : Description            },
    {
      $Type       : 'UI.DataField',
      Value       : TravelStatus_code,
      Criticality : { $edmJson: { $If: [{$Eq: [{ $Path: 'TravelStatus_code'}, 'O']}, 2,
                                { $If: [{$Eq: [{ $Path: 'TravelStatus_code'}, 'A']}, 3, 0] }] } },
      Label : '{i18n>Status}' // label only necessary if differs from title of element
    }
  ]},
  FieldGroup #DateData : {Data : [
    { $Type : 'UI.DataField', Value : BeginDate },
    { $Type : 'UI.DataField', Value : EndDate }
  ]},
  FieldGroup #PriceData : {Data : [
    { $Type : 'UI.DataField', Value : BookingFee },
    { $Type : 'UI.DataField', Value : TotalPrice },
    { $Type : 'UI.DataField', Value : CurrencyCode_code }
  ]}
};

annotate TravelService.Booking with @UI : {
  Identification : [
    { Value : BookingID },
  ],
  HeaderInfo : {
    TypeName       : '{i18n>Bookings}',
    TypeNamePlural : '{i18n>Bookings}',
    Title          : { Value : to_Customer.LastName },
    Description    : { Value : BookingID }
  },
  PresentationVariant : {
    Visualizations : ['@UI.LineItem'],
    SortOrder      : [{
      $Type      : 'Common.SortOrderType',
      Property   : BookingID,
      Descending : false
    }]
  },
  SelectionFields : [],
  LineItem : [
    { Value : to_Carrier.AirlinePicURL,  Label : '  '},
    { Value : BookingID              },
    { Value : BookingDate            },
    { Value : to_Customer_CustomerID },
    { Value : to_Carrier_AirlineID   },
    { Value : ConnectionID,          Label : '{i18n>FlightNumber}' },
    { Value : FlightDate             },
    { Value : FlightPrice            },
    { Value : BookingStatus_code,
      Criticality : { $edmJson: { $If: [{$Eq: [{ $Path: 'BookingStatus_code'}, 'N']}, 2,
                                { $If: [{$Eq: [{ $Path: 'BookingStatus_code'}, 'B']}, 3, 0] }] } }
    }
  ],
  Facets : [{
    $Type  : 'UI.CollectionFacet',
    Label  : '{i18n>GeneralInformation}',
    ID     : 'Booking',
    Facets : [{  // booking details
      $Type  : 'UI.ReferenceFacet',
      ID     : 'BookingData',
      Target : '@UI.FieldGroup#GeneralInformation',
      Label  : '{i18n>Booking}'
    }, {  // flight details
      $Type  : 'UI.ReferenceFacet',
      ID     : 'FlightData',
      Target : '@UI.FieldGroup#Flight',
      Label  : '{i18n>Flight}'
    }]
  }, {  // supplements list
    $Type  : 'UI.ReferenceFacet',
    ID     : 'SupplementsList',
    Target : 'to_BookSupplement/@UI.PresentationVariant',
    Label  : '{i18n>BookingSupplements}'
  }],
  FieldGroup #GeneralInformation : { Data : [
    { Value : BookingID              },
    { Value : BookingDate,           },
    { Value : to_Customer_CustomerID },
    { Value : BookingDate,           },
    { Value : BookingStatus_code,
      Criticality : { $edmJson: { $If: [{$Eq: [{ $Path: 'BookingStatus_code'}, 'N']}, 2,
                                { $If: [{$Eq: [{ $Path: 'BookingStatus_code'}, 'B']}, 3, 0] }] } }
     }
  ]},
  FieldGroup #Flight : { Data : [
    { Value : to_Carrier_AirlineID   },
    { Value : ConnectionID           },
    { Value : FlightDate             },
    { Value : FlightPrice            }
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
  PresentationVariant : {
    Text           : 'Default',
    Visualizations : ['@UI.LineItem'],
    SortOrder      : [{
      $Type      : 'Common.SortOrderType',
      Property   : BookingSupplementID,
      Descending : false
    }]
  },
  LineItem : [
    { Value : BookingSupplementID                                       },
    { Value : to_Supplement_SupplementID, Label : '{i18n>ProductID}'    },
    { Value : Price,                      Label : '{i18n>ProductPrice}' }
  ],
};
