sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/format/DateFormat"
], function (Controller, MessageToast, Fragment, JSONModel, DateFormat) {
    "use strict";

    return Controller.extend("iService_UI5.controller.expert", {
        onInit: function () {
            var sPath = $.sap.getModulePath(
                "iService_UI5",
                "/model/applicationProperties.json"
            );
            var that = this;

            var oSettingsModel = new sap.ui.model.json.JSONModel();
            oSettingsModel.loadData(sPath);
            oSettingsModel.attachRequestCompleted(function () {
                that.getView().setModel(this, "Experts");
                var serviceURL = that
                    .getView()
                    .getModel("Experts")
                    .getProperty("/oDataUrl");
                var oModel = new sap.ui.model.odata.v2.ODataModel(serviceURL);
                that.getView().setModel(oModel);
            });

        },
        geti18n: function (sKey) {
            return this.getView().getModel("i18n").getResourceBundle().getText(sKey);
        },

        onCreateExpert: function () {
            console.log("pressed");
            var that = this;
            // Step 1: Define JSONModel instance for new expert
            var oNewExpertModel = new sap.ui.model.json.JSONModel();
            oNewExpertModel = {
                zucc_expert: "",
                mo: false,
                tu: false,
                we: false,
                th: false,
                fr: false,
                valid_from: "",
                valid_to: ""
            };

            // Step 2: Load the Fragment
            if (!this.byId("newExpertDialog")) {
                Fragment.load({
                    id: this.getView().getId(),
                    name: "iService_UI5.fragment.createExpert",
                    controller: this
                }).then(function (oDialog) {
                    // Connect dialog to the root view of this component (models, lifecycle)
                    this.getView().addDependent(oDialog);
                    // Step 3: Set the model
                    oDialog.setModel(this.oNewExpertModel, "expertCreate");
                    // Step 4: Open the dialog
                    oDialog.open();
                }.bind(this));
            } else {
                this.byId("newExpertDialog").open();
            }
        },

        onSaveExpert: function () {
            var that = this;
            // Step 1: Get the current data from the JSONModel instance
            // TODO: Change data according to expertCreate Model
            var oPayload = new JSONModel({
                "zucc_expert": this.getView().getModel("expertCreate").getProperty("/Expert").zucc_expert,
                "mo": this.getView().getModel("expertCreate").getProperty("/Expert").mo,
                "tu": this.getView().getModel("expertCreate").getProperty("/Expert").tu,
                "we": this.getView().getModel("expertCreate").getProperty("/Expert").we,
                "th": this.getView().getModel("expertCreate").getProperty("/Expert").th,
                "fr": this.getView().getModel("expertCreate").getProperty("/Expert").fr,
                "valid_from": this.getView().getModel("expertCreate").getProperty("/Expert").valid_from,
                "valid_to": this.getView().getModel("expertCreate").getProperty("/Expert").valid_to
            });

            // Step 2: Convert Checkbox value to 1 if checked and 0 if unchecked
            oPayload.oData.mo = oPayload.oData.mo ? 1 : 0;
            oPayload.oData.tu = oPayload.oData.tu ? 1 : 0;
            oPayload.oData.we = oPayload.oData.we ? 1 : 0;
            oPayload.oData.th = oPayload.oData.th ? 1 : 0;
            oPayload.oData.fr = oPayload.oData.fr ? 1 : 0;

            //Step 3: Convert Date into right format
            var oDateFormat = DateFormat.getDateInstance({ pattern: "dd.MM.yyyy" });
            oPayload.oData.valid_from = oDateFormat.parse(oPayload.oData.valid_from);
            oPayload.oData.valid_to = oDateFormat.parse(oPayload.oData.valid_to);
            console.log(oPayload.oData.valid_from);


            // Step 3: Get ODataModel instance and create new entity
            console.log(oPayload.oData);
            var serviceURL = this.getView().getModel("Experts").getProperty("/oDataUrl");
            var oModel = new sap.ui.model.odata.v2.ODataModel(serviceURL);
            oModel.create("/zcrm_expert_availabilitySet", oPayload.oData, {
                success: function () {
                    MessageToast.show("Expert created successfully!");
                    that.onClear();
                    that.byId("newExpertDialog").close();
                }.bind(this),
                error: function () {
                    MessageToast.show("Error while creating the expert.");
                }
            });
        },
        onCancelSave: function () {
            var that = this;
            that.byId("newExpertDialog").close();
            MessageToast.show(this.geti18n("expertNotCreated"));
        },

        onUpdateSelectedExpert: function () {
            //Code for updating the selected expert
            MessageToast.show("Update function not implemented");
        },

        onDeleteSelectedExpert: function () {
            //Code for deleting the selected expert
            MessageToast.show("Delete function not implemented");
        },
        onClear: function () {
            var serviceURL = this.getView().getModel("Experts").getProperty("/oDataUrl");
            var oModel = new sap.ui.model.odata.v2.ODataModel(serviceURL);
            this.getView().byId("expertTable").setModel(oModel);
        },
    });
});
