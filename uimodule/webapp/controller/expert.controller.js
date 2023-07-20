sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/format/DateFormat",
    "sap/m/Dialog"
], function (Controller, MessageToast, Fragment, JSONModel, DateFormat, Dialog) {
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
            var that = this;
            var oDateFormat = DateFormat.getDateInstance({ pattern: "dd.MM.yyyy" });
            var cancelButton = new sap.m.Button({
                text: that.geti18n("cancel"),
                type: sap.m.ButtonType.Default,
                press: function () {
                    sap.ui.getCore().byId("updatePopup").destroy();
                },
            });

            var updateButton = new sap.m.Button({
                text: that.geti18n("update"),
                type: sap.m.ButtonType.Accept,
                press: function () {
                    var serviceURL = that
                        .getView()
                        .getModel("Experts")
                        .getProperty("/oDataUrl");
                    var oModel = new sap.ui.model.odata.v2.ODataModel(serviceURL);

                    var oUpdatedExpert = {
                        zucc_expert: sap.ui.getCore().byId("updatezucc_expert").getValue(),
                        mo: sap.ui.getCore().byId("updatemo").getSelected() ? 1 : 0,
                        tu: sap.ui.getCore().byId("updatetu").getSelected() ? 1 : 0,
                        we: sap.ui.getCore().byId("updatewe").getSelected() ? 1 : 0,
                        th: sap.ui.getCore().byId("updateth").getSelected() ? 1 : 0,
                        fr: sap.ui.getCore().byId("updatefr").getSelected() ? 1 : 0,
                        valid_from: oDateFormat.parse(sap.ui.getCore().byId("updatevalid_from").getValue()),
                        valid_to: oDateFormat.parse(sap.ui.getCore().byId("updatevalid_to").getValue()),
                    };

                    var updateZuccExpert = sap.ui.getCore().byId("updatezucc_expert").getValue();
                    var dPath = "/zcrm_expert_availabilitySet(zucc_expert='" + updateZuccExpert + "')";

                    oModel.update(dPath, oUpdatedExpert, {
                        success: function () {


                            MessageToast.show("Successfully updated!");
                            oModel.refresh();
                            that.onClear();
                            sap.ui.getCore().byId("updatePopup").destroy();
                        },
                        error: function (oError) {
                            sap.m.MessageToast.show("Error during contract update");
                        },
                    });
                },
            });

            if (that.getView().byId("expertTable").getSelectedItem() != null) {
                var selectedItem = that
                    .getView()
                    .byId("expertTable")
                    .getSelectedItem()
                    .getBindingContext();

                var oDialog = new sap.m.Dialog("updatePopup", {
                    title: that.geti18n("updatePopupexpert"),
                    modal: true,
                    contentWidth: "4em",
                    buttons: [updateButton, cancelButton],
                    content: [
                        new sap.m.Label({
                            text: that.geti18n("zucc_expert"),
                        }),
                        new sap.m.Input({
                            id: "updatezucc_expert",
                            value: selectedItem.getProperty("zucc_expert"),
                            editable: false,
                        }),
                        new sap.m.Label({
                            text: that.geti18n("Mo"),
                        }),
                        new sap.m.CheckBox({
                            id: "updatemo",
                            value: selectedItem.getProperty("mo"),
                            editable: true,
                        }),
                        new sap.m.Label({
                            text: that.geti18n("Tu"),
                        }),
                        new sap.m.CheckBox({
                            id: "updatetu",
                            value: selectedItem.getProperty("tu"),
                            editable: true,
                        }),
                        new sap.m.Label({
                            text: that.geti18n("We"),
                        }),
                        new sap.m.CheckBox({
                            id: "updatewe",
                            value: selectedItem.getProperty("we"),
                            editable: true,
                        }),
                        new sap.m.Label({
                            text: that.geti18n("Th"),
                        }),
                        new sap.m.CheckBox({
                            id: "updateth",
                            value: selectedItem.getProperty("th"),
                            editable: true,
                        }),
                        new sap.m.Label({
                            text: that.geti18n("Fr"),
                        }),
                        new sap.m.CheckBox({
                            id: "updatefr",
                            value: selectedItem.getProperty("fr"),
                            editable: true,
                        }),
                        new sap.m.Label({
                            text: that.geti18n("ValidFrom"),
                        }),
                        new sap.m.DatePicker({
                            id: "updatevalid_from",
                            value: selectedItem.getProperty("valid_from"),
                            editable: true,
                        }),
                        new sap.m.Label({
                            text: that.geti18n("ValidTo"),
                        }),
                        new sap.m.DatePicker({
                            id: "updatevalid_to",
                            value: selectedItem.getProperty("valid_to"),
                            editable: true,
                        }),

                    ],
                });
            }
            if (selectedItem != null) {
                sap.ui.getCore().byId("updatePopup").open();
            } else {
                MessageToast.show(that.geti18n("errorSelectFirst"));
                sap.ui.getCore().byId("updatePopup").destroy();
            }
        },

        onDeleteSelectedExpert: function () {
            var that = this;


            var cancelButton = new sap.m.Button({
                text: that.geti18n("cancel"),
                type: sap.m.ButtonType.Default,
                press: function () {
                    sap.ui.getCore().byId("deletePopup").destroy();
                },
            });

            var deleteButton = new sap.m.Button({
                text: that.geti18n("delete"),
                type: sap.m.ButtonType.Reject,
                press: function () {
                    var serviceURL = that
                        .getView()
                        .getModel("Experts")
                        .getProperty("/oDataUrl");
                    var oModel = new sap.ui.model.odata.v2.ODataModel(serviceURL);

                    var deleteZuccExpert = sap.ui.getCore().byId("deleteZuccExpert").getValue();
                    var dPath = "/zcrm_expert_availabilitySet(zucc_expert='" + deleteZuccExpert + "')";
                    oModel.remove(dPath, {
                        success: function () {
                            MessageToast.show("Successfully deleted");
                            oModel.refresh();
                            that.onClear();
                            sap.ui.getCore().byId("deletePopup").destroy();

                        },
                        error: function () {
                            MessageToast.show("Error during Expert deletion");
                        },
                    });
                },
            });

            if (that.getView().byId("expertTable").getSelectedItem() != null) {
                var selectedItem = that
                    .getView()
                    .byId("expertTable")
                    .getSelectedItem()
                    .getBindingContext();

                var oDialog = new Dialog("deletePopup", {
                    title: that.geti18n("deletePopupExpert"),
                    modal: true,
                    contentWidth: "1em",
                    buttons: [deleteButton, cancelButton],
                    content: [
                        new sap.m.Label({
                            text: that.geti18n("zucc_expert"),
                        }),
                        new sap.m.Input({
                            id: "deleteZuccExpert",
                            value: selectedItem.getProperty("zucc_expert"),
                            editable: false,
                        }),
                    ],
                });
            }
            if (selectedItem != null) {
                sap.ui.getCore().byId("deletePopup").open();
            } else {
                MessageToast.show(that.geti18n("errorSelectFirst"));
                sap.ui.getCore().byId("deletePopup").destroy();
            }
        },

        onClear: function () {
            var serviceURL = this.getView().getModel("Experts").getProperty("/oDataUrl");
            var oModel = new sap.ui.model.odata.v2.ODataModel(serviceURL);
            this.getView().byId("expertTable").setModel(oModel);
        },
    });
}
);
