// https://github.tools.sap/DataPlane/cloud-data-integration-specification/blob/master/specification/v1.4/admin_metadata.xml

using { com.sap.dps } from '../db/dps-integration';
using { sap.fe.cap.travel as my } from '../db/schema';
using { sap.common } from '@sap/cds/common';

service com.sap.cloudDataIntegration {

  @Capabilities.UpdateRestrictions.Updatable: false
  @Capabilities.InsertRestrictions.Insertable: false
  @Capabilities.DeleteRestrictions.Deletable: false
  entity Namespaces as projection on dps.Namespaces;

  @Capabilities.UpdateRestrictions.Updatable: false
  @Capabilities.InsertRestrictions.Insertable: false
  @Capabilities.DeleteRestrictions.Deletable: false
  entity Providers as projection on dps.Providers;

  @Capabilities.UpdateRestrictions.Updatable: false
  @Capabilities.FilterRestrictions: {
    Filterable: true,
    FilterExpressionRestrictions: [
      { Property: NamespaceID,    AllowedExpressions: #MultiValueOrSearchExpression },  // according to vocabulary this should be a string rather than an enum
      { Property: ProviderID,     AllowedExpressions: #MultiValueOrSearchExpression },
      { Property: SubscriptionID, AllowedExpressions: #MultiValueOrSearchExpression },
      { Property: ExternalID,     AllowedExpressions: #MultiValueOrSearchExpression }
    ]
  }
  entity Subscriptions as projection on dps.Subscriptions;
}


@path:'/cdi-airport'
service com.sap.cloudDataIntegrationData.Airport {
  @DataIntegration.Extractable
  entity Airport as projection on my.Airport {
    *,
    CountryCode.code as CountryCode
  };
}

@path:'/cdi-airline'
service com.sap.cloudDataIntegrationData.Airline {
  @DataIntegration.Extractable
  entity Airline as projection on my.Airline {
    *,
    CurrencyCode.code as CurrencyCode
  };
}

@path:'/cdi-flight'
service com.sap.cloudDataIntegrationData.Flight {
  @DataIntegration.Extractable
  entity Flight as projection on my.Flight {
    *,
    CurrencyCode.code as CurrencyCode
  } excluding {to_Airline, to_Connection};
}

@path:'/cdi-flight-connection'
service com.sap.cloudDataIntegrationData.FlightConnection {
  @DataIntegration.Extractable
  entity FlightConnection as projection on my.FlightConnection {
    *,
    DepartureAirport.AirportID as DepartureAirport,
    DestinationAirport.AirportID as DestinationAirport
  } excluding {to_Airline};
}

@path:'/cdi-countries'
service com.sap.cloudDataIntegrationData.Countries {
  @DataIntegration.Extractable
  entity Countries as projection on common.Countries {
    *
  } excluding {name, description, texts, localized};  // exclude localized elements for the time being

  entity Countries_texts as projection on common.Countries.texts;
}

@path:'/cdi-currencies'
service com.sap.cloudDataIntegrationData.Currencies {
  @DataIntegration.Extractable
  entity Currencies as projection on common.Currencies {
    *
  } excluding {name, description, texts, localized};  // exclude localized elements for the time being

  entity Currencies_texts as projection on common.Currencies.texts;
}
