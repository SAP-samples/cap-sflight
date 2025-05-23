sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel"
], function (Controller, MessageToast, JSONModel) {
    "use strict";

    return Controller.extend("company.contactform.app.controller.ContactForm", {
        onInit: function () {
            // Create a new JSON model for the form data
            this.getView().setModel(new JSONModel({
                name: "",
                email: "",
                company: "",
                phone: "",
                message: ""
            }), "formModel");
        },

        _validateForm: function() {
            var oFormModel = this.getView().getModel("formModel");
            var oData = oFormModel.getData();
            var bValid = true;
            var oResourceBundle = this.getView().getModel("i18n").getResourceBundle();

            if (!oData.name || oData.name.trim() === "") {
                MessageToast.show(oResourceBundle.getText("validationNameMandatory"));
                bValid = false;
            }
            if (!oData.email || !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(oData.email)) {
                 MessageToast.show(oResourceBundle.getText("validationEmailInvalid"));
                bValid = false;
            }
            if (!oData.message || oData.message.trim() === "") {
                 MessageToast.show(oResourceBundle.getText("validationMessageMandatory"));
                bValid = false;
            }
            return bValid;
        },

        onSubmit: function () {
            if (!this._validateForm()) {
                return;
            }

            var oFormModel = this.getView().getModel("formModel");
            var oData = oFormModel.getData();
            var oODataModel = this.getView().getModel(); // Default OData model
            var oResourceBundle = this.getView().getModel("i18n").getResourceBundle();

            oODataModel.create("/ContactRequests", oData, {
                success: function () {
                    MessageToast.show(oResourceBundle.getText("submitSuccess"));
                    // Clear form
                    oFormModel.setData({
                        name: "",
                        email: "",
                        company: "",
                        phone: "",
                        message: ""
                    });
                }.bind(this),
                error: function (oError) {
                    MessageToast.show(oResourceBundle.getText("submitError"));
                    console.error(oError);
                }.bind(this)
            });
        }
    });
});
