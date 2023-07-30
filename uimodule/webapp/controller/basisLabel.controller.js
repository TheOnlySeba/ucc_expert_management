sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/format/DateFormat",
    "sap/m/Dialog"
], function (Controller, MessageToast, Fragment, JSONModel, DateFormat, Dialog) {
    "use strict";

    return Controller.extend("iService_UI5.controller.basisLabel", {
        onInit: function () {
            var sPath = $.sap.getModulePath(
                "iService_UI5",
                "/model/applicationProperties.json"
            );
            var that = this;
            var oTable;


            var oSettingsModel = new sap.ui.model.json.JSONModel();
            oSettingsModel.loadData(sPath);
            oSettingsModel.attachRequestCompleted(function () {
                that.getView().setModel(this, "basisLabels");
                var serviceURL = that
                    .getView()
                    .getModel("basisLabels")
                    .getProperty("/oDataUrl");
                var oModel = new sap.ui.model.odata.v2.ODataModel(serviceURL);
                that.getView().setModel(oModel);
                oTable = that.getView().byId("basisLabelTable").getTable();
                oTable.setMode("MultiSelect");
                oTable.attachSelectionChange(that.onTableSelection(), this);




            });

        },

        onTableSelection: function () {
            var that = this;
            var aSelectedItems = that.getView().byId("basisLabelTable").getTable().getSelectedItems();
            console.log(aSelectedItems);
        },
        geti18n: function (sKey) {
            return this.getView().getModel("i18n").getResourceBundle().getText(sKey);
        },

        onCreateBasisLabel: function () {
            console.log("pressed");
            var that = this;
            // Step 1: Define JSONModel instance for new expert
            var oNewBasisLabelModel = new JSONModel();
            oNewBasisLabelModel = {
                ZPRODUCT: "",
                ZUCC_EXPERT_MO_1: "",
                ZUCC_EXPERT_MO_2: "",
                ZUCC_EXPERT_MO_3: "",
                ZUCC_EXPERT_DI_1: "",
                ZUCC_EXPERT_DI_2: "",
                ZUCC_EXPERT_DI_3: "",
                ZUCC_EXPERT_MI_1: "",
                ZUCC_EXPERT_MI_2: "",
                ZUCC_EXPERT_MI_3: "",
                ZUCC_EXPERT_DO_1: "",
                ZUCC_EXPERT_DO_2: "",
                ZUCC_EXPERT_DO_3: "",
                ZUCC_EXPERT_FR_1: "",
                ZUCC_EXPERT_FR_2: "",
                ZUCC_EXPERT_FR_3: ""
            };


            // Step 2: Load the Fragment
            if (!this.byId("newBasisLabelDialog")) {
                Fragment.load({
                    id: this.getView().getId(),
                    name: "iService_UI5.fragment.createBasisLabel",
                    controller: this
                }).then(function (basisDialog) {
                    // Connect dialog to the root view of this component (models, lifecycle)
                    this.getView().addDependent(basisDialog);
                    console.log(this.getView().addDependent(basisDialog));
                    // Step 3: Set the model
                    basisDialog.setModel(this.oNewBasisLabelModel, "basisLabelCreate");



                    // Step 4: Open the dialog
                    basisDialog.open();
                }.bind(this));
            } else {
                this.byId("newBasisLabelDialog").open();
            }
        },

        onSaveLabel: function () {
            console.log(this.getView().getModel("labelCreate"));
            var that = this;
            // Step 1: Get the current data from the JSONModel instance
            // TODO: Change data according to expertCreate Model
            var oPayload = new JSONModel({
                "ZPRODUCT": this.getView().getModel("basisLabelCreate").getProperty("/BasisLabel").ZPRODUCT,
                "ZUCC_EXPERT_MO_1": this.getView().getModel("basisLabelCreate").getProperty("/BasisLabel").ZUCC_EXPERT_MO_1,
                "ZUCC_EXPERT_MO_2": this.getView().getModel("basisLabelCreate").getProperty("/BasisLabel").ZUCC_EXPERT_MO_2,
                "ZUCC_EXPERT_MO_3": this.getView().getModel("basisLabelCreate").getProperty("/BasisLabel").ZUCC_EXPERT_MO_3,
                "ZUCC_EXPERT_DI_1": this.getView().getModel("basisLabelCreate").getProperty("/BasisLabel").ZUCC_EXPERT_DI_1,
                "ZUCC_EXPERT_DI_2": this.getView().getModel("basisLabelCreate").getProperty("/BasisLabel").ZUCC_EXPERT_DI_2,
                "ZUCC_EXPERT_DI_3": this.getView().getModel("basisLabelCreate").getProperty("/BasisLabel").ZUCC_EXPERT_DI_3,
                "ZUCC_EXPERT_MI_1": this.getView().getModel("basisLabelCreate").getProperty("/BasisLabel").ZUCC_EXPERT_MI_1,
                "ZUCC_EXPERT_MI_2": this.getView().getModel("basisLabelCreate").getProperty("/BasisLabel").ZUCC_EXPERT_MI_2,
                "ZUCC_EXPERT_MI_3": this.getView().getModel("basisLabelCreate").getProperty("/BasisLabel").ZUCC_EXPERT_MI_3,
                "ZUCC_EXPERT_DO_1": this.getView().getModel("basisLabelCreate").getProperty("/BasisLabel").ZUCC_EXPERT_DO_1,
                "ZUCC_EXPERT_DO_2": this.getView().getModel("basisLabelCreate").getProperty("/BasisLabel").ZUCC_EXPERT_DO_2,
                "ZUCC_EXPERT_DO_3": this.getView().getModel("basisLabelCreate").getProperty("/BasisLabel").ZUCC_EXPERT_DO_3,
                "ZUCC_EXPERT_FR_1": this.getView().getModel("basisLabelCreate").getProperty("/BasisLabel").ZUCC_EXPERT_FR_1,
                "ZUCC_EXPERT_FR_2": this.getView().getModel("basisLabelCreate").getProperty("/BasisLabel").ZUCC_EXPERT_FR_2,
                "ZUCC_EXPERT_FR_3": this.getView().getModel("basisLabelCreate").getProperty("/BasisLabel").ZUCC_EXPERT_FR_3

            });



            // Step 2: Get ODataModel instance and create new entity

            var serviceURL = this.getView().getModel("basisLabels").getProperty("/oDataUrl");
            var oModel = new sap.ui.model.odata.v2.ODataModel(serviceURL);
            oModel.create("/zcrm_basis_labelSet", oPayload.oData, {
                success: function () {
                    MessageToast.show("Label created successfully!");
                    that.onClear();
                    that.byId("newBasisLabelDialog").close();
                }.bind(this),
                error: function () {
                    MessageToast.show("Error while creating the label.");
                }
            });
        },
        onCancelSave: function () {
            var that = this;
            that.byId("newBasisLabelDialog").close();
            MessageToast.show(this.geti18n("labelNotCreated"));
        },

        onUpdateSelectedLabel: function (oEvent) {
            var that = this;

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
                        .getModel("basisLabels")
                        .getProperty("/oDataUrl");
                    var oModel = new sap.ui.model.odata.v2.ODataModel(serviceURL);

                    var oUpdatedLabel = {
                        ZLABEL_ID: parseInt(sap.ui.getCore().byId("updatezlabel_id").getValue()),
                        ZPRODUCT: sap.ui.getCore().byId("updatezproduct").getValue(),
                        ZUCC_EXPERT_MO_1: sap.ui.getCore().byId("updatemo1").getValue(),
                        ZUCC_EXPERT_MO_2: sap.ui.getCore().byId("updatemo2").getValue(),
                        ZUCC_EXPERT_MO_3: sap.ui.getCore().byId("updatemo3").getValue(),
                        ZUCC_EXPERT_DI_1: sap.ui.getCore().byId("updatedi1").getValue(),
                        ZUCC_EXPERT_DI_2: sap.ui.getCore().byId("updatedi2").getValue(),
                        ZUCC_EXPERT_DI_3: sap.ui.getCore().byId("updatedi3").getValue(),
                        ZUCC_EXPERT_MI_1: sap.ui.getCore().byId("updatemi1").getValue(),
                        ZUCC_EXPERT_MI_2: sap.ui.getCore().byId("updatemi2").getValue(),
                        ZUCC_EXPERT_MI_3: sap.ui.getCore().byId("updatemi3").getValue(),
                        ZUCC_EXPERT_DO_1: sap.ui.getCore().byId("updatedo1").getValue(),
                        ZUCC_EXPERT_DO_2: sap.ui.getCore().byId("updatedo2").getValue(),
                        ZUCC_EXPERT_DO_3: sap.ui.getCore().byId("updatedo3").getValue(),
                        ZUCC_EXPERT_FR_1: sap.ui.getCore().byId("updatefr1").getValue(),
                        ZUCC_EXPERT_FR_2: sap.ui.getCore().byId("updatefr2").getValue(),
                        ZUCC_EXPERT_FR_3: sap.ui.getCore().byId("updatefr3").getValue(),

                    };

                    var updateLabel = parseInt(sap.ui.getCore().byId("updatezlabel_id").getValue());
                    var dPath = "/zcrm_basis_labelSet(ZLABEL_ID=" + updateLabel + ")";
                    console.log(oUpdatedLabel);

                    oModel.update(dPath, oUpdatedLabel, {
                        success: function () {


                            MessageToast.show("Successfully updated!");
                            oModel.refresh();
                            that.onClear();
                            sap.ui.getCore().byId("updatePopup").destroy();
                        },
                        error: function (oError) {
                            sap.m.MessageToast.show("Error during label update");
                        },
                    });
                },
            });

            console.log(that.getView().byId("basisLabelTable").getTable().getSelectedItems());

            if (that.getView().byId("basisLabelTable").getTable().getSelectedItems() != null) {


                var selectedItem = that
                    .getView()
                    .byId("basisLabelTable")
                    .getTable().getSelectedItem();

                console.log(selectedItem);


                var oDialog = new sap.m.Dialog("updatePopup", {
                    title: that.geti18n("updatePopuplabel"),
                    modal: true,
                    contentWidth: "4em",
                    buttons: [updateButton, cancelButton],
                    content: [
                        new sap.m.Label({
                            text: that.geti18n("zlabel_id"),
                        }),
                        new sap.m.Input({
                            id: "updatezlabel_id",
                            value: selectedItem.getProperty("ZLABEL_ID"),
                            editable: false,
                        }),
                        new sap.m.Label({
                            text: that.geti18n("zproduct"),
                        }),
                        new sap.m.Input({
                            id: "updatezproduct",
                            value: selectedItem.getProperty("ZPRODUCT"),
                            editable: false,
                        }),
                        new sap.m.Label({
                            text: that.geti18n("Mo1"),
                        }),
                        new sap.m.Input({
                            id: "updatemo1",
                            value: selectedItem.getProperty("ZUCC_EXPERT_MO_1"),
                            editable: true,
                        }),
                        new sap.m.Label({
                            text: that.geti18n("Mo2"),
                        }),
                        new sap.m.Input({
                            id: "updatemo2",
                            value: selectedItem.getProperty("ZUCC_EXPERT_MO_2"),
                            editable: true,
                        }),
                        new sap.m.Label({
                            text: that.geti18n("Mo3"),
                        }),
                        new sap.m.Input({
                            id: "updatemo3",
                            value: selectedItem.getProperty("ZUCC_EXPERT_MO_3"),
                            editable: true,
                        }),
                        new sap.m.Label({
                            text: that.geti18n("Di1"),
                        }),
                        new sap.m.Input({
                            id: "updatedi1",
                            value: selectedItem.getProperty("ZUCC_EXPERT_DI_1"),
                            editable: true,
                        }),
                        new sap.m.Label({
                            text: that.geti18n("Di2"),
                        }),
                        new sap.m.Input({
                            id: "updatedi2",
                            value: selectedItem.getProperty("ZUCC_EXPERT_DI_2"),
                            editable: true,
                        }),
                        new sap.m.Label({
                            text: that.geti18n("Di3"),
                        }),
                        new sap.m.Input({
                            id: "updatedi3",
                            value: selectedItem.getProperty("ZUCC_EXPERT_DI_3"),
                            editable: true,
                        }),
                        new sap.m.Label({
                            text: that.geti18n("Mi1"),
                        }),
                        new sap.m.Input({
                            id: "updatemi1",
                            value: selectedItem.getProperty("ZUCC_EXPERT_MI_1"),
                            editable: true,
                        }),
                        new sap.m.Label({
                            text: that.geti18n("Mi2"),
                        }),
                        new sap.m.Input({
                            id: "updatemi2",
                            value: selectedItem.getProperty("ZUCC_EXPERT_MI_2"),
                            editable: true,
                        }),
                        new sap.m.Label({
                            text: that.geti18n("Mi3"),
                        }),
                        new sap.m.Input({
                            id: "updatemi3",
                            value: selectedItem.getProperty("ZUCC_EXPERT_MI_3"),
                            editable: true,
                        }),
                        new sap.m.Label({
                            text: that.geti18n("Do1"),
                        }),
                        new sap.m.Input({
                            id: "updatedo1",
                            value: selectedItem.getProperty("ZUCC_EXPERT_DO_1"),
                            editable: true,
                        }),
                        new sap.m.Label({
                            text: that.geti18n("Do2"),
                        }),
                        new sap.m.Input({
                            id: "updatedo2",
                            value: selectedItem.getProperty("ZUCC_EXPERT_DO_2"),
                            editable: true,
                        }),
                        new sap.m.Label({
                            text: that.geti18n("Do3"),
                        }),
                        new sap.m.Input({
                            id: "updatedo3",
                            value: selectedItem.getProperty("ZUCC_EXPERT_DO_3"),
                            editable: true,
                        }),
                        new sap.m.Label({
                            text: that.geti18n("Fr1"),
                        }),
                        new sap.m.Input({
                            id: "updatefr1",
                            value: selectedItem.getProperty("ZUCC_EXPERT_FR_1"),
                            editable: true,
                        }),
                        new sap.m.Label({
                            text: that.geti18n("Fr2"),
                        }),
                        new sap.m.Input({
                            id: "updatefr2",
                            value: selectedItem.getProperty("ZUCC_EXPERT_FR_2"),
                            editable: true,
                        }),
                        new sap.m.Label({
                            text: that.geti18n("Fr3"),
                        }),
                        new sap.m.Input({
                            id: "updatefr3",
                            value: selectedItem.getProperty("ZUCC_EXPERT_FR_3"),
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

        onDeleteSelectedLabel: function () {
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
                        .getModel("basisLabels")
                        .getProperty("/oDataUrl");
                    var oModel = new sap.ui.model.odata.v2.ODataModel(serviceURL);

                    var deleteLabel = parseInt(sap.ui.getCore().byId("deleteLabel").getValue());
                    var dPath = "/zcrm_basis_labelSet(ZLABEL_ID=" + deleteLabel + ")";
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

            if (that.getView().byId("basisLabelTable").getSelectedItem() != null) {
                var selectedItem = that
                    .getView()
                    .byId("basisLabelTable")
                    .getSelectedItem()
                    .getBindingContext();

                var oDialog = new Dialog("deletePopup", {
                    title: that.geti18n("deletePopupLabel"),
                    modal: true,
                    contentWidth: "1em",
                    buttons: [deleteButton, cancelButton],
                    content: [
                        new sap.m.Label({
                            text: that.geti18n("label"),
                        }),
                        new sap.m.Input({
                            id: "deleteLabel",
                            value: selectedItem.getProperty("ZLABEL_ID"),
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
            var serviceURL = this.getView().getModel("basisLabels").getProperty("/oDataUrl");
            var oModel = new sap.ui.model.odata.v2.ODataModel(serviceURL);
            this.getView().byId("basisLabelTable").setModel(oModel);
        },
    });
}
);
