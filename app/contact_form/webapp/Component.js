sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/Device",
    "company/contactform/app/model/models" // This file won't exist yet, but it's standard. Can be created empty or omitted for now.
], function (UIComponent, Device, models) {
    "use strict";

    return UIComponent.extend("company.contactform.app.Component", {
        metadata: {
            manifest: "json"
        },

        init: function () {
            // call the base component's init function
            UIComponent.prototype.init.apply(this, arguments);

            // enable routing
            this.getRouter().initialize();

            // set the device model - this line can be removed if models.js is not created
            // this.setModel(models.createDeviceModel(), "device");
        }
    });
});
