// right-align Price in table?
// navigation from table ...


using AnalyticsService as service from '../../srv/analytics-service';

annotate service.Bookings with {
  ID           @ID    : 'ID';
  rid          @title : 'Travel/BookingID';
  ConnectionID @title : 'ConnectionID';
  FlightDate   @title : 'FlightDate';
  price        @title : 'Price';
  fieldWithCurrency  @title : 'XXX';
  status       @title : 'Status';
  airline      @title : 'Airline';
};

annotate service.Bookings with @(
  Aggregation.CustomAggregate #price : 'Edm.Decimal',
  Aggregation.CustomAggregate #cuco : 'Edm.String',

  Aggregation.CustomAggregate #fieldWithUnit : 'Edm.Decimal',
  Aggregation.CustomAggregate #QuantityUnit : 'Edm.String',

  Aggregation.CustomAggregate #fieldWithCurrency : 'Edm.Decimal',
  Aggregation.CustomAggregate #CurrCode : 'Edm.String',

  Common.SemanticKey : [ID],

  UI.LineItem        : [ // all fields used here must be listed below in "GroupableProperties", otherwise no content is shown
    {
      Value          : rid,
      @UI.Importance : #High,
    },
    {
      Value          : ConnectionID,
      @UI.Importance : #High,
    },
    {
      Value          : FlightDate,
      @UI.Importance : #High,
    },
    {
      Value          : fieldWithUnit,
      @UI.Importance : #High,
    },
    {
      Value          : price,
      @UI.Importance : #High,
    },
    // {
    //   Value          : fieldWithCurrency,
    //   @UI.Importance : #High,
    // },
    {
      Value          : status,
      @UI.Importance : #High,
    },
    {
      Value          : airline,
      @UI.Importance : #High,
    },
  ],
);

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
//  Rollup                 : #None,
//  PropertyRestrictions   : true,
  GroupableProperties    : [
    rid,
    ConnectionID,
    FlightDate,
    //price,

    cuco,
    QuantityUnit,
    CurrCode,

    status,
    airline,
  ],
  AggregatableProperties : [
    {Property : status, },
    {Property : price, },
    {Property : fieldWithUnit, },
    {Property : fieldWithCurrency, },
    {Property : ID, },
  ],
};

annotate service.Bookings with @Analytics.AggregatedProperties : [
  {
    Name                 : 'minPrice',
    AggregationMethod    : 'min',
    AggregatableProperty : 'price',
    @Common.Label        : 'Minimal Price'
  },
  {
    Name                 : 'maxPrice',
    AggregationMethod    : 'max',
    AggregatableProperty : 'price',
    @Common.Label        : 'Maximal Price'
  },
  {
    Name                 : 'avgPrice',
    AggregationMethod    : 'average',
    AggregatableProperty : 'price',
    @Common.Label        : 'Average Price'
  },
  {
    Name                 : 'sumPrice',
    AggregationMethod    : 'sum',
    AggregatableProperty : 'price',
    @Common.Label        : 'Total Price'
  },

  // {
  //   Name                 : 'sumFWC',
  //   AggregationMethod    : 'sum',
  //   AggregatableProperty : 'fieldWithCurrency',
  //   @Common.Label        : 'Total FWC'
  // },

  {
    Name                 : 'qsum',
    AggregationMethod    : 'sum',
    AggregatableProperty : 'fieldWithUnit',
    @Common.Label        : 'QSum'
  },

  {
    Name                 : 'countBookings',
    AggregationMethod    : 'countdistinct',
    AggregatableProperty : 'ID',
    @Common.Label        : 'Bookings'
  },
];

annotate service.Bookings with @UI.Chart : {
  Title               : 'Flight Bookings',
  ChartType           : #Column,
  Measures            : [sumPrice],
  Dimensions          : [status],
  MeasureAttributes   : [{
    $Type   : 'UI.ChartMeasureAttributeType',
    Measure : sumPrice,
    Role    : #Axis1
  }],
  DimensionAttributes : [{
    $Type     : 'UI.ChartDimensionAttributeType',
    Dimension : status,
    Role      : #Category
  }, ],
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



/*





annotate service.Bookings with @UI : {
  Identification : [
    { Value : rid },
  ],
  HeaderInfo : {
    TypeName       : '{i18n>Bookings}',
    TypeNamePlural : '{i18n>Bookings}',
    Title          : { Value : rid },
    Description    : { Value : rid }
  },
  // PresentationVariant : {
  //   Visualizations : ['@UI.LineItem'],
  //   SortOrder      : [{
  //     $Type      : 'Common.SortOrderType',
  //     Property   : BookingID,
  //     Descending : false
  //   }]
  // },
  // SelectionFields : [],
  // LineItem : [
  //   { Value : to_Carrier.AirlinePicURL,  Label : '  '},
  //   { Value : BookingID              },
  //   { Value : BookingDate            },
  //   { Value : to_Customer_CustomerID },
  //   { Value : to_Carrier_AirlineID   },
  //   { Value : ConnectionID,          Label : '{i18n>FlightNumber}' },
  //   { Value : FlightDate             },
  //   { Value : FlightPrice            },
  //   { Value : BookingStatus_code     }
  // ],
  Facets : [{
    $Type  : 'UI.CollectionFacet',
    Label  : '{i18n>GeneralInformation}',
    ID     : 'Booking',
    Facets : [{  // booking details
      $Type  : 'UI.ReferenceFacet',
      ID     : 'BookingData',
      Target : '@UI.FieldGroup#GeneralInformation',
      Label  : '{i18n>Booking}'
    },
    {  // travel info
      $Type  : 'UI.ReferenceFacet',
      ID     : 'TravelData',
      Target : '@UI.FieldGroup#Travel',
      Label  : '{i18n>Flight}'
    }
    ]
  },
  // {  // supplements list
  //   $Type  : 'UI.ReferenceFacet',
  //   Target : 'to_BookSupplement/@UI.PresentationVariant',
  //   Label  : '{i18n>BookingSupplements}'
  // }
  ],
  FieldGroup #GeneralInformation : { Data : [
    { Value : rid              },
    { Value : FlightDate,           },
    { Value : price },
    { Value : airline,           },
    { Value : departure,           },
    { Value : destination,           },
    { Value : dist,           },
  ]},
  FieldGroup #Travel : { Data : [
    { Value : travelID    },
    { Value : travelDescr },
    { Value : travelLastName },
  ]},
};

*/