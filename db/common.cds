using { User, sap, managed } from '@sap/cds/common';

extend sap.common.Currencies with {
  // Currencies.code = ISO 4217 alphabetic three-letter code
  // with the first two letters being equal to ISO 3166 alphabetic country codes
  // See also:
  // [1] https://www.iso.org/iso-4217-currency-codes.html
  // [2] https://www.currency-iso.org/en/home/tables/table-a1.html
  // [3] https://www.ibm.com/support/knowledgecenter/en/SSZLC2_7.0.0/com.ibm.commerce.payments.developer.doc/refs/rpylerl2mst97.htm
  numcode  : Integer;
  exponent : Integer; //> e.g. 2 --> 1 Dollar = 10^2 Cent
  minor    : String; //> e.g. 'Cent'
}


// aspect custom.managed {
//   createdAt  : managed:createdAt;
//   createdBy  : managed:createdBy;
//   LastChangedAt : managed:modifiedAt;
//   LastChangedBy : managed:modifiedBy;
// }

//////////////////////////////////////////////////////////////////////////
//
//  Workaround for the above
//

aspect custom.managed {
  createdAt     : Timestamp @cds.on.insert : $now;
  createdBy     : User      @cds.on.insert : $user;
  LastChangedAt : Timestamp @cds.on.insert : $now  @cds.on.update : $now;
  LastChangedBy : User      @cds.on.insert : $user @cds.on.update : $user;
}

annotate custom.managed with {
  createdAt     @UI.HiddenFilter;
  createdBy     @UI.HiddenFilter;
  LastChangedAt @UI.HiddenFilter;
  LastChangedBy @UI.HiddenFilter;
}

// TODO: these annotations would cause a popup requesting input for these fields on "create travel", ...
// annotate custom.managed with {
//   createdAt  @Core.Immutable;
//   createdBy  @Core.Immutable;
// }

annotate custom.managed with {
  createdAt     @title : '{i18n>CreatedAt}';
  createdBy     @title : '{i18n>CreatedBy}';
  LastChangedAt @title : '{i18n>ChangedAt}';
  LastChangedBy @title : '{i18n>ChangedBy}';
}

//
//////////////////////////////////////////////////////////////////////////
