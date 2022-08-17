// https://github.tools.sap/DataPlane/cloud-data-integration-specification/blob/master/specification/v1.4/admin_metadata.xml

using { com.sap.dps } from '../db/dps-integration';

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
      { Property: NamespaceID,    AllowedExpressions: #MultiValueOrSearchExpression },
      { Property: ProviderID,     AllowedExpressions: #MultiValueOrSearchExpression },
      { Property: SubscriptionID, AllowedExpressions: #MultiValueOrSearchExpression },
      { Property: ExternalID,     AllowedExpressions: #MultiValueOrSearchExpression }
    ]
  }
  entity Subscriptions as projection on dps.Subscriptions;

}