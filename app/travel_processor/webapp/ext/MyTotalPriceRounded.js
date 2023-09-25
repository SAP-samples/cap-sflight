sap.ui.define([], function () {
  "use strict";

  return {
    displayTotalPriceRounded: function (price) {
      console.log({ price });
      const priceWithoutPennies = new String(price).replace(/\..*/i, "");
      console.log({ priceWithoutPennies });
      return `${priceWithoutPennies} USD`;
    },
  };
});
