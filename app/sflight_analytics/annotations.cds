// right-align Price in table?
// navigation from table ...


using AnalyticsService as service from '../../srv/analytics-service';

annotate service.Bookings with @(
  Aggregation.CustomAggregate #price : 'Edm.Decimal',
  Aggregation.CustomAggregate #cuco : 'Edm.String',
  Common.SemanticKey : [ID],
) {
  ID           @ID    : 'ID';
  price        @Analytics.Measure: true
               @Aggregation.default: #SUM;
  cuco         @Analytics.Measure: true
               @Aggregation.default: #MAX;
};


annotate service.Bookings with @Aggregation.ApplySupported : {
  Transformations        : [
    'aggregate',
    'topcount',
    'bottomcount',
    'identity',
    'concat',
    'groupby',
    'filter',
    'expand',
    'top',
    'skip',
    'orderby',
    'search'
  ],
  Rollup                 : #None,
  PropertyRestrictions   : true,
  GroupableProperties    : [
    ReadableID,
    ConnectionID,
    FlightDate,
    cuco,
    status,
    airline,
  ],
  AggregatableProperties : [
    {Property : status },
    {Property : price },
    {Property : ID },
  ],
};

annotate service.Bookings with @Analytics.AggregatedProperties : [
  {
    Name                 : 'minPrice',
    AggregationMethod    : 'min',
    AggregatableProperty : price,
    @Common.Label        : 'Minimal Price'
  }, {
    Name                 : 'maxPrice',
    AggregationMethod    : 'max',
    AggregatableProperty : price,
    @Common.Label        : 'Maximal Price'
  }, {
    Name                 : 'avgPrice',
    AggregationMethod    : 'average',
    AggregatableProperty : price,
    @Common.Label        : 'Average Price'
  }, {
    Name                 : 'sumPrice',
    AggregationMethod    : 'sum',
    AggregatableProperty : price,
    @Common.Label        : 'Total Price'
  }, {
    Name                 : 'countBookings',
    AggregationMethod    : 'countdistinct',
    AggregatableProperty : ID,
    @Common.Label        : 'Bookings'
  }
];

annotate service.Bookings with @UI.LineItem : [
  {
    Value          : ReadableID,
    @UI.Importance : #High,
  }, {
    Value          : airline,
    @UI.Importance : #High,
  }, {
    Value          : ConnectionID,
    @UI.Importance : #High,
  }, {
    Value          : FlightDate,
    @UI.Importance : #High,
  }, {
    Value          : price,
    @UI.Importance : #High,
  }, {
    Value          : status,
    @UI.Importance : #High,
  }
];

annotate service.Bookings with @UI.Chart : {
  Title               : 'Flight Bookings',
  ChartType           : #Column,
  Measures            : [minPrice, avgPrice, maxPrice],
  Dimensions          : [airline],
  MeasureAttributes   : [{
    $Type   : 'UI.ChartMeasureAttributeType',
    Measure : minPrice,
    Role    : #Axis1
  }],
  DimensionAttributes : [{
    $Type     : 'UI.ChartDimensionAttributeType',
    Dimension : airline,
    Role      : #Category
  }],
};

annotate service.Bookings with @UI.PresentationVariant : {
  GroupBy : [  // default grouping in table
    airline,
    status
  ],
  Total : [    // default aggregation in table
    price
  ],
  Visualizations : [
    '@UI.Chart',
    '@UI.LineItem',
  ]
};



//
// Visual Filters
//

annotate service.Bookings with @(
  UI.PresentationVariant #pvAirline : {
    SortOrder      : [{
      $Type      : 'Common.SortOrderType',
      Property   : price,
      Descending : true
    }, ],
    Visualizations : ['@UI.Chart#chartAirline']
  },
  UI.SelectionVariant #svAirline    : {SelectOptions : [{
    $Type        : 'UI.SelectOptionType',
    PropertyName : price,
    Ranges       : [{
      $Type  : 'UI.SelectionRangeType',
      Sign   : #I,
      Option : #GE,
      Low    : 0,
    }, ],
  }, ], },
  UI.Chart #chartAirline            : {
    $Type               : 'UI.ChartDefinitionType',
    ChartType           : #Bar,
    Dimensions          : [airline],
    DimensionAttributes : [{
      $Type     : 'UI.ChartDimensionAttributeType',
      Dimension : airline,
      Role      : #Category
    }],
    Measures            : [countBookings],
    MeasureAttributes   : [{
      $Type     : 'UI.ChartMeasureAttributeType',
      Measure   : countBookings,
      Role      : #Axis1,
      DataPoint : '@UI.DataPoint#dpAirline',
    }]
  },
  UI.DataPoint #dpAirline           : {
    Value : price,
    Title : 'Price'
  },
) {
  airline @(Common.ValueList #vlAirline : {
    Label                        : 'Airline',
    CollectionPath               : 'Bookings',
    SearchSupported              : true,
    PresentationVariantQualifier : 'pvAirline',
    SelectionVariantQualifier    : 'svAirline',
    Parameters                   : [{
      $Type             : 'Common.ValueListParameterInOut',
      LocalDataProperty : airline,
      ValueListProperty : 'airline'
    }, ]
  });
};


annotate service.Bookings with @(
  UI.PresentationVariant #pvPrio : {
    SortOrder      : [{
      $Type      : 'Common.SortOrderType',
      Property   : price,
      Descending : true
    }, ],
    Visualizations : ['@UI.Chart#chartPrio']
  },
  UI.SelectionVariant #svPrio    : {SelectOptions : [{
    $Type        : 'UI.SelectOptionType',
    PropertyName : price,
    Ranges       : [{
      $Type  : 'UI.SelectionRangeType',
      Sign   : #I,
      Option : #GE,
      Low    : 0,
    }, ],
  }, ], },
  UI.Chart #chartPrio            : {
    $Type               : 'UI.ChartDefinitionType',
    ChartType           : #Bar,
    Dimensions          : [status],
    DimensionAttributes : [{
      $Type     : 'UI.ChartDimensionAttributeType',
      Dimension : status,
      Role      : #Category
    }],
    Measures            : [countBookings],
    MeasureAttributes   : [{
      $Type     : 'UI.ChartMeasureAttributeType',
      Measure   : countBookings,
      Role      : #Axis1,
      DataPoint : '@UI.DataPoint#dpPrio',
    }]
  },
  UI.DataPoint #dpPrio           : {
    Value : price,
    Title : 'Price'
  },
) {
  status @(Common.ValueList #vlPrio : {
    Label                        : 'Status',
    CollectionPath               : 'Bookings',
    SearchSupported              : true,
    PresentationVariantQualifier : 'pvPrio',
    SelectionVariantQualifier    : 'svPrio',
    Parameters                   : [{
      $Type             : 'Common.ValueListParameterInOut',
      LocalDataProperty : status,
      ValueListProperty : 'status'
    }, ]
  });
};


annotate service.Bookings with @(
  UI.PresentationVariant #pvPeriod : {
    Text           : 'FilterRisksOverPeriodPV',
    SortOrder      : [{
      $Type      : 'Common.SortOrderType',
      Property   : FlightDate,
      Descending : true
    }, ],
    Visualizations : ['@UI.Chart#chartPeriod']
  },
  UI.Chart #chartPeriod            : {
    $Type               : 'UI.ChartDefinitionType',
    Title               : 'Risks Over Period',
    ChartType           : #Line,
    Dimensions          : [FlightDate],
    DimensionAttributes : [{
      $Type     : 'UI.ChartDimensionAttributeType',
      Dimension : FlightDate,
      Role      : #Category
    }],
    Measures            : [countBookings],
    MeasureAttributes   : [{
      $Type     : 'UI.ChartMeasureAttributeType',
      Measure   : countBookings,
      Role      : #Axis1,
      DataPoint : '@UI.DataPoint#dpPeriod',
    }]
  },
  UI.DataPoint #dpPeriod           : {
    Value : FlightDate,
    Title : 'Flight Date'
  },
) {
  FlightDate @(Common.ValueList #vlcreatedAt : {
    Label                        : 'Flight Date',
    CollectionPath               : 'Bookings',
    SearchSupported              : true,
    PresentationVariantQualifier : 'pvPeriod',
    Parameters                   : [{
      $Type             : 'Common.ValueListParameterInOut',
      LocalDataProperty : FlightDate,
      ValueListProperty : 'FlightDate'
    }, ]
  });
};

//
// KPI
//

annotate service.Bookings with @(
  UI.KPI #myKPI1 : {
    DataPoint : {
      $Type            : 'UI.DataPointType',
      Value            : price,
      Title            : 'Preis',
      Description      : 'Preis',
      CriticalityCalculation : {
        ImprovementDirection: #Maximize,
        AcceptanceRangeLowValue: 26000000,
        ToleranceRangeLowValue:  24000000,
        DeviationRangeLowValue:  22000000
      }
      // Criticality      : #Critical,     //criticality_code,
      // TrendCalculation : {
      //   $Type                : 'UI.TrendCalculationType',
      //   ReferenceValue       : 27000000, // targetValue,
      //   StrongUpDifference   :  3000000,
      //   UpDifference         :   500000,
      //   DownDifference       : -3000000,
      //   StrongDownDifference :  -500000
      // },
      // TargetValue      : 26000000
    },

    Detail : {
      $Type                      : 'UI.KPIDetailType',
      DefaultPresentationVariant : {
        $Type          : 'UI.PresentationVariantType',
        Visualizations : [
          '@UI.Chart#kpi1'
        ],
      },
    },

    SelectionVariant : {
      $Type         : 'UI.SelectionVariantType',
      SelectOptions : [{
        $Type        : 'UI.SelectOptionType',
        PropertyName : price,
        Ranges       : [{
          $Type  : 'UI.SelectionRangeType',
          Sign   : #E,
          Option : #EQ,
          Low    : 0,
        }, ],
      }],
    }
  },

  UI.Chart #kpi1 : {
    $Type               : 'UI.ChartDefinitionType',
    ChartType           : #Line,
    Measures            : [price],
    Dimensions          : [FlightDate],
    MeasureAttributes   : [{
      $Type   : 'UI.ChartMeasureAttributeType',
      Measure : price,
      Role    : #Axis1
    }],
    DimensionAttributes : [{
      $Type     : 'UI.ChartDimensionAttributeType',
      Dimension : FlightDate,
      Role      : #Category
    }]
  },
);






//
// Detail page
//
annotate service.Bookings with @UI : {
  Identification : [
    { Value : ReadableID },
  ],
  HeaderInfo : {
    TypeName       : '{i18n>Bookings}',
    TypeNamePlural : '{i18n>Bookings}',
    Title          : { Value : ReadableID },
    Description    : { Value : ReadableID }
  },
  Facets : [{
    $Type  : 'UI.CollectionFacet',
    Label  : 'Booking Information', //'{i18n>GeneralInformation}',
    ID     : 'Booking',
    Facets : [{
      $Type  : 'UI.ReferenceFacet',
      ID     : 'TravelData',
      Target : '@UI.FieldGroup#TravelInformation',
      Label  : '{i18n>Travel}'
    }, {
      $Type  : 'UI.ReferenceFacet',
      ID     : 'BookingData',
      Target : '@UI.FieldGroup#BookingInformation',
      Label  : '{i18n>Booking}'
    }, {
      $Type  : 'UI.ReferenceFacet',
      ID     : 'FlightData',
      Target : '@UI.FieldGroup#FlightInformation',
      Label  : '{i18n>Flight}'
    }
    ]
  }],
  FieldGroup #TravelInformation : { Data : [
    { Value : to_Travel.TravelID,   Label: 'ID'   },
    { Value : to_Travel.Description                      },
    { Value : to_Travel.to_Agency.Name,                      },
    { Value : to_Travel.CustomerName,  },
  ]},
  FieldGroup #BookingInformation : { Data : [
    { Value : BookingID,   Label: 'ID'             },
    { Value : BookingDate           },
    { Value : FlightDate,           },
    { Value : price                 },
  ]},
  FieldGroup #FlightInformation : { Data : [
    { Value : airline,                  },
    { Value : to_Carrier.AirlinePicURL, },
    { Value : ConnectionID              },
    { Value : to_Flight.PlaneType       },
    { Value : to_Flight.to_Connection.DepartureAirport.AirportID,   Label: 'Departure Airport' },
    { Value : to_Flight.to_Connection.DestinationAirport.AirportID, Label: 'Arrival Airport'   },
    { Value : to_Flight.to_Connection.Distance,             },
  ]},
};

