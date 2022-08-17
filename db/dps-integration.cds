namespace com.sap.dps;

entity Namespaces {
  key NamespaceID : String;
  Description : String;

  Providers : Association to many Providers on Providers.Namespace = $self;
}

entity Providers {
  key ProviderID : String;
  key NamespaceID : String;
  Description : String;
  ServiceURL : String;
  
  Namespace : Association to one Namespaces on Namespace.NamespaceID = NamespaceID;
  Subscriptions : Association to many Subscriptions on Subscriptions.NamespaceID = NamespaceID
                                                    and Subscriptions.ProviderID = ProviderID;
}

entity Subscriptions {
  key SubscriptionID : String;
  key NamespaceID : String;
  key ProviderID : String;
  Filter : String;
  Selection : String;
  Description : String;
  CurrentDeltaLink : String;
  PreviousDeltaLink : String;
  ExternalID : String;
  EntitySetName : String;
}
