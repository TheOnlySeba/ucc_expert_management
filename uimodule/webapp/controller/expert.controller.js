sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment"
], function (Controller, MessageToast, Fragment) {
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
                Mail: "",
                Mo: false,
                Tu: false,
                We: false,
                Th: false,
                Fr: false,
                ValidFrom: "",
                ValidTo: ""
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
            // Step 1: Get the current data from the JSONModel instance
            var oData = this.getView().getModel("expertCreate").getData();

            // Step 2: Convert Checkbox value to 1 if checked and 0 if unchecked
            oData.Mo = oData.Mo ? "1" : "0";
            oData.Tu = oData.Tu ? "1" : "0";
            oData.We = oData.We ? "1" : "0";
            oData.Th = oData.Th ? "1" : "0";
            oData.Fr = oData.Fr ? "1" : "0";

            // Step 3: Map JSONModel data to new object with structure of backend entity
            var oNewExpert = {
                Mail: oData.Mail,
                Mo: oData.Mo,
                Tu: oData.Tu,
                We: oData.We,
                Th: oData.Th,
                Fr: oData.Fr,
                ValidFrom: oData.ValidFrom,
                ValidTo: oData.ValidTo
            };

            // Step 4: Get ODataModel instance and create new entity
            var oModel = this.getOwnerComponent().getModel();
            oModel.create("/zcrm_expert_availabilitySet", oNewExpert, {
                success: function () {
                    MessageToast.show("Expert created successfully!");
                    this.byId("newExpertDialog").close();
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
        }
    });
});
