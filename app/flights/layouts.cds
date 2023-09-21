using FlightsService from '../../srv/flights-service';

annotate FlightsService.Flights with @Common.SemanticKey: [FlightID];

//
// annotatios that control the fiori layout
//

annotate FlightsService.Flights {

  DepAirport @Common.ValueList: {
    CollectionPath : 'Airport',
    Label : '',
    Parameters : [
      {$Type: 'Common.ValueListParameterInOut', LocalDataProperty: DepAirport, ValueListProperty: 'AirportID'},  // here FK is required
      {$Type: 'Common.ValueListParameterDisplayOnly', ValueListProperty: 'AirportID'},
      {$Type: 'Common.ValueListParameterDisplayOnly', ValueListProperty: 'Name'},
      {$Type: 'Common.ValueListParameterDisplayOnly', ValueListProperty: 'City'},
      {$Type: 'Common.ValueListParameterDisplayOnly', ValueListProperty: 'CountryCode_code'}
    ]
  };
  DestAirport @Common.ValueList: {
    CollectionPath : 'Airport',
    Label : '',
    Parameters : [
      {$Type: 'Common.ValueListParameterInOut', LocalDataProperty: DestAirport, ValueListProperty: 'AirportID'},  // here FK is required
      {$Type: 'Common.ValueListParameterDisplayOnly', ValueListProperty: 'AirportID'},
      {$Type: 'Common.ValueListParameterDisplayOnly', ValueListProperty: 'Name'},
      {$Type: 'Common.ValueListParameterDisplayOnly', ValueListProperty: 'City'},
      {$Type: 'Common.ValueListParameterDisplayOnly', ValueListProperty: 'CountryCode_code'}
    ]
  };

}


annotate FlightsService.Flights with @UI : {

  Identification : [
    { Value: FlightID },
  ],
  HeaderInfo : {
    TypeName       : '{i18n>Flight}',
    TypeNamePlural : '{i18n>Flights}',
    Title          : {
      $Type : 'UI.DataField',
      Value : FlightID
    },
    Description    : {
      $Type : 'UI.DataField',
      Value : FromTo
    }
  },
  PresentationVariant : {
    Visualizations : ['@UI.LineItem'],
    SortOrder      : [{
      $Type      : 'Common.SortOrderType',
      Property   : FlightDate,
      Descending : true
    }]
  },
  SelectionFields : [
    AirlineID,
    DepAirport,
    DestAirport
  ],
  LineItem : [
    {
      Value : FlightID,
      @HTML5.CssDefaults: {width:'8em'}
    },
    {
      Value : DepAirport,
      @UI.Importance : #High
    },
    {
      Value : DestAirport,
      @UI.Importance : #High
    },
    {
      Value : FlightDate,
      @UI.Importance : #High
    },
    {
      Value : to_Connection.DepartureTime,
    },
    {
      Value : to_Connection.ArrivalTime,
    },
    {
      Value : Price,
      @UI.Importance : #High
    },
    {
      Value : OccupiedSeats,
      Criticality : OccupiedCriticality,
    }
  ],
  Facets : [
    {
      $Type  : 'UI.ReferenceFacet',
      ID     : 'FlightData',
      Target : '@UI.FieldGroup#FlightData',
      Label  : '{i18n>Flight}'
    },
    {
      $Type  : 'UI.ReferenceFacet',
      ID     : 'DateTime',
      Target : '@UI.FieldGroup#Connection',
      Label  : 'Connection'
    },
    {
      $Type  : 'UI.ReferenceFacet',
      ID     : 'Plane',
      Target : '@UI.FieldGroup#Plane',
      Label  : 'Plane'
    },
  ],
  FieldGroup#FlightData : { Data : [
    { Value : AirlineID },
    { Value : ConnectionID  },
    { Value : Price },
  ]},
  FieldGroup#Connection : { Data : [
    { Value : FlightDate  },
    { Value : to_Connection.DepartureTime  },
    { Value : to_Connection.ArrivalTime },
    { Value : DepAirport },
    { Value : DestAirport },
    { Value : to_Connection.Distance  },
  ]},
  FieldGroup#Plane : { Data : [
    { Value : PlaneType  },
    { Value : MaximumSeats  },
    {
      Value : OccupiedSeats,
      Criticality : OccupiedCriticality,
    }
  ]}
};
