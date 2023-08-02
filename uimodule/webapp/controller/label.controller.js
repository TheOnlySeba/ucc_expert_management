sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/format/DateFormat",
    "sap/m/Dialog"
], function (Controller, MessageToast, Fragment, JSONModel, DateFormat, Dialog) {
    "use strict";

    return Controller.extend("iService_UI5.controller.label", {
        onInit: function () {
            var sPath = $.sap.getModulePath(
                "iService_UI5",
                "/model/applicationProperties.json"
            );
            var that = this;

            var oSettingsModel = new sap.ui.model.json.JSONModel();
            oSettingsModel.loadData(sPath);
            oSettingsModel.attachRequestCompleted(function () {
                that.getView().setModel(this, "Labels");
                var serviceURL = that
                    .getView()
                    .getModel("Labels")
                    .getProperty("/oDataUrl");
                var oModel = new sap.ui.model.odata.v2.ODataModel(serviceURL);
                that.getView().setModel(oModel);


            });

        },
        geti18n: function (sKey) {
            return this.getView().getModel("i18n").getResourceBundle().getText(sKey);
        },

        onCreateLabel: function () {
            console.log("pressed");
            var that = this;
            // Step 1: Define JSONModel instance for new expert
            var oNewLabelModel = new JSONModel();
            oNewLabelModel = {
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
            if (!this.byId("newLabelDialog")) {
                Fragment.load({
                    id: this.getView().getId(),
                    name: "iService_UI5.fragment.createLabel",
                    controller: this
                }).then(function (oDialog) {
                    console.log(this.getView().getId());
                    // Connect dialog to the root view of this component (models, lifecycle)
                    this.getView().addDependent(oDialog);
                    console.log(this.getView().addDependent(oDialog));
                    // Step 3: Set the model
                    oDialog.setModel(this.oNewLabelModel, "labelCreate");
                    console.log(oDialog.getModel("labelCreate"));
                    // Step 4: Open the dialog
                    oDialog.open();
                }.bind(this));
            } else {
                this.byId("newLabelDialog").open();
            }
        },

        onSaveLabel: function () {
            var that = this;
            // Step 1: Get the current data from the JSONModel instance
            // TODO: Change data according to expertCreate Model
            var oPayload = new JSONModel({
                "ZPRODUCT": this.getView().getModel("labelCreate").getProperty("/Label").ZPRODUCT,
                "ZUCC_EXPERT_MO_1": this.getView().getModel("labelCreate").getProperty("/Label").ZUCC_EXPERT_MO_1,
                "ZUCC_EXPERT_MO_2": this.getView().getModel("labelCreate").getProperty("/Label").ZUCC_EXPERT_MO_2,
                "ZUCC_EXPERT_MO_3": this.getView().getModel("labelCreate").getProperty("/Label").ZUCC_EXPERT_MO_3,
                "ZUCC_EXPERT_DI_1": this.getView().getModel("labelCreate").getProperty("/Label").ZUCC_EXPERT_DI_1,
                "ZUCC_EXPERT_DI_2": this.getView().getModel("labelCreate").getProperty("/Label").ZUCC_EXPERT_DI_2,
                "ZUCC_EXPERT_DI_3": this.getView().getModel("labelCreate").getProperty("/Label").ZUCC_EXPERT_DI_3,
                "ZUCC_EXPERT_MI_1": this.getView().getModel("labelCreate").getProperty("/Label").ZUCC_EXPERT_MI_1,
                "ZUCC_EXPERT_MI_2": this.getView().getModel("labelCreate").getProperty("/Label").ZUCC_EXPERT_MI_2,
                "ZUCC_EXPERT_MI_3": this.getView().getModel("labelCreate").getProperty("/Label").ZUCC_EXPERT_MI_3,
                "ZUCC_EXPERT_DO_1": this.getView().getModel("labelCreate").getProperty("/Label").ZUCC_EXPERT_DO_1,
                "ZUCC_EXPERT_DO_2": this.getView().getModel("labelCreate").getProperty("/Label").ZUCC_EXPERT_DO_2,
                "ZUCC_EXPERT_DO_3": this.getView().getModel("labelCreate").getProperty("/Label").ZUCC_EXPERT_DO_3,
                "ZUCC_EXPERT_FR_1": this.getView().getModel("labelCreate").getProperty("/Label").ZUCC_EXPERT_FR_1,
                "ZUCC_EXPERT_FR_2": this.getView().getModel("labelCreate").getProperty("/Label").ZUCC_EXPERT_FR_2,
                "ZUCC_EXPERT_FR_3": this.getView().getModel("labelCreate").getProperty("/Label").ZUCC_EXPERT_FR_3

            });



            // Step 2: Get ODataModel instance and create new entity

            var serviceURL = this.getView().getModel("Labels").getProperty("/oDataUrl");
            var oModel = new sap.ui.model.odata.v2.ODataModel(serviceURL);
            oModel.create("/zcrm_label_map001Set", oPayload.oData, {
                success: function () {
                    MessageToast.show("Label created successfully!");
                    that.onClear();
                    that.byId("newLabelDialog").close();
                }.bind(this),
                error: function () {
                    MessageToast.show("Error while creating the label.");
                }
            });
        },
        // onCancelSave: function () {
        //     var that = this;
        //     that.byId("newLabelDialog").close();
        //     MessageToast.show(this.geti18n("labelNotCreated"));
        // },

        // onUpdateSelectedLabel: function () {
        //     var that = this;

        //     var cancelButton = new sap.m.Button({
        //         text: that.geti18n("cancel"),
        //         type: sap.m.ButtonType.Default,
        //         press: function () {
        //             sap.ui.getCore().byId("updatePopup").destroy();
        //         },
        //     });

        //     var updateButton = new sap.m.Button({
        //         text: that.geti18n("update"),
        //         type: sap.m.ButtonType.Accept,
        //         press: function () {
        //             var serviceURL = that
        //                 .getView()
        //                 .getModel("Labels")
        //                 .getProperty("/oDataUrl");
        //             var oModel = new sap.ui.model.odata.v2.ODataModel(serviceURL);

        //             var oUpdatedLabel = {
        //                 ZLABEL_ID: parseInt(sap.ui.getCore().byId("updatezlabel_id").getValue()),
        //                 ZPRODUCT: sap.ui.getCore().byId("updatezproduct").getValue(),
        //                 ZUCC_EXPERT_MO_1: sap.ui.getCore().byId("updatemo1").getValue(),
        //                 ZUCC_EXPERT_MO_2: sap.ui.getCore().byId("updatemo2").getValue(),
        //                 ZUCC_EXPERT_MO_3: sap.ui.getCore().byId("updatemo3").getValue(),
        //                 ZUCC_EXPERT_DI_1: sap.ui.getCore().byId("updatedi1").getValue(),
        //                 ZUCC_EXPERT_DI_2: sap.ui.getCore().byId("updatedi2").getValue(),
        //                 ZUCC_EXPERT_DI_3: sap.ui.getCore().byId("updatedi3").getValue(),
        //                 ZUCC_EXPERT_MI_1: sap.ui.getCore().byId("updatemi1").getValue(),
        //                 ZUCC_EXPERT_MI_2: sap.ui.getCore().byId("updatemi2").getValue(),
        //                 ZUCC_EXPERT_MI_3: sap.ui.getCore().byId("updatemi3").getValue(),
        //                 ZUCC_EXPERT_DO_1: sap.ui.getCore().byId("updatedo1").getValue(),
        //                 ZUCC_EXPERT_DO_2: sap.ui.getCore().byId("updatedo2").getValue(),
        //                 ZUCC_EXPERT_DO_3: sap.ui.getCore().byId("updatedo3").getValue(),
        //                 ZUCC_EXPERT_FR_1: sap.ui.getCore().byId("updatefr1").getValue(),
        //                 ZUCC_EXPERT_FR_2: sap.ui.getCore().byId("updatefr2").getValue(),
        //                 ZUCC_EXPERT_FR_3: sap.ui.getCore().byId("updatefr3").getValue(),

        //             };

        //             var updateLabel = parseInt(sap.ui.getCore().byId("updatezlabel_id").getValue());
        //             var dPath = "/zcrm_label_map001Set(ZLABEL_ID=" + updateLabel + ")";

        //             oModel.update(dPath, oUpdatedLabel, {
        //                 success: function () {


        //                     MessageToast.show("Successfully updated!");
        //                     oModel.refresh();
        //                     that.onClear();
        //                     sap.ui.getCore().byId("updatePopup").destroy();
        //                 },
        //                 error: function (oError) {
        //                     sap.m.MessageToast.show("Error during label update");
        //                 },
        //             });
        //         },
        //     });

        //     if (that.getView().byId("labelTable").getSelectedItem() != null) {
        //         var selectedItem = that
        //             .getView()
        //             .byId("labelTable")
        //             .getSelectedItem()
        //             .getBindingContext();

        //         var oDialog = new sap.m.Dialog("updatePopup", {
        //             title: that.geti18n("updatePopuplabel"),
        //             modal: true,
        //             contentWidth: "4em",
        //             buttons: [updateButton, cancelButton],
        //             content: [
        //                 new sap.m.Label({
        //                     text: that.geti18n("zlabel_id"),
        //                 }),
        //                 new sap.m.Input({
        //                     id: "updatezlabel_id",
        //                     value: selectedItem.getProperty("ZLABEL_ID"),
        //                     editable: false,
        //                 }),
        //                 new sap.m.Label({
        //                     text: that.geti18n("zproduct"),
        //                 }),
        //                 new sap.m.Input({
        //                     id: "updatezproduct",
        //                     value: selectedItem.getProperty("ZPRODUCT"),
        //                     editable: false,
        //                 }),
        //                 new sap.m.Label({
        //                     text: that.geti18n("Mo1"),
        //                 }),
        //                 new sap.m.Input({
        //                     id: "updatemo1",
        //                     value: selectedItem.getProperty("ZUCC_EXPERT_MO_1"),
        //                     editable: true,
        //                 }),
        //                 new sap.m.Label({
        //                     text: that.geti18n("Mo2"),
        //                 }),
        //                 new sap.m.Input({
        //                     id: "updatemo2",
        //                     value: selectedItem.getProperty("ZUCC_EXPERT_MO_2"),
        //                     editable: true,
        //                 }),
        //                 new sap.m.Label({
        //                     text: that.geti18n("Mo3"),
        //                 }),
        //                 new sap.m.Input({
        //                     id: "updatemo3",
        //                     value: selectedItem.getProperty("ZUCC_EXPERT_MO_3"),
        //                     editable: true,
        //                 }),
        //                 new sap.m.Label({
        //                     text: that.geti18n("Di1"),
        //                 }),
        //                 new sap.m.Input({
        //                     id: "updatedi1",
        //                     value: selectedItem.getProperty("ZUCC_EXPERT_DI_1"),
        //                     editable: true,
        //                 }),
        //                 new sap.m.Label({
        //                     text: that.geti18n("Di2"),
        //                 }),
        //                 new sap.m.Input({
        //                     id: "updatedi2",
        //                     value: selectedItem.getProperty("ZUCC_EXPERT_DI_2"),
        //                     editable: true,
        //                 }),
        //                 new sap.m.Label({
        //                     text: that.geti18n("Di3"),
        //                 }),
        //                 new sap.m.Input({
        //                     id: "updatedi3",
        //                     value: selectedItem.getProperty("ZUCC_EXPERT_DI_3"),
        //                     editable: true,
        //                 }),
        //                 new sap.m.Label({
        //                     text: that.geti18n("Mi1"),
        //                 }),
        //                 new sap.m.Input({
        //                     id: "updatemi1",
        //                     value: selectedItem.getProperty("ZUCC_EXPERT_MI_1"),
        //                     editable: true,
        //                 }),
        //                 new sap.m.Label({
        //                     text: that.geti18n("Mi2"),
        //                 }),
        //                 new sap.m.Input({
        //                     id: "updatemi2",
        //                     value: selectedItem.getProperty("ZUCC_EXPERT_MI_2"),
        //                     editable: true,
        //                 }),
        //                 new sap.m.Label({
        //                     text: that.geti18n("Mi3"),
        //                 }),
        //                 new sap.m.Input({
        //                     id: "updatemi3",
        //                     value: selectedItem.getProperty("ZUCC_EXPERT_MI_3"),
        //                     editable: true,
        //                 }),
        //                 new sap.m.Label({
        //                     text: that.geti18n("Do1"),
        //                 }),
        //                 new sap.m.Input({
        //                     id: "updatedo1",
        //                     value: selectedItem.getProperty("ZUCC_EXPERT_DO_1"),
        //                     editable: true,
        //                 }),
        //                 new sap.m.Label({
        //                     text: that.geti18n("Do2"),
        //                 }),
        //                 new sap.m.Input({
        //                     id: "updatedo2",
        //                     value: selectedItem.getProperty("ZUCC_EXPERT_DO_2"),
        //                     editable: true,
        //                 }),
        //                 new sap.m.Label({
        //                     text: that.geti18n("Do3"),
        //                 }),
        //                 new sap.m.Input({
        //                     id: "updatedo3",
        //                     value: selectedItem.getProperty("ZUCC_EXPERT_DO_3"),
        //                     editable: true,
        //                 }),
        //                 new sap.m.Label({
        //                     text: that.geti18n("Fr1"),
        //                 }),
        //                 new sap.m.Input({
        //                     id: "updatefr1",
        //                     value: selectedItem.getProperty("ZUCC_EXPERT_FR_1"),
        //                     editable: true,
        //                 }),
        //                 new sap.m.Label({
        //                     text: that.geti18n("Fr2"),
        //                 }),
        //                 new sap.m.Input({
        //                     id: "updatefr2",
        //                     value: selectedItem.getProperty("ZUCC_EXPERT_FR_2"),
        //                     editable: true,
        //                 }),
        //                 new sap.m.Label({
        //                     text: that.geti18n("Fr3"),
        //                 }),
        //                 new sap.m.Input({
        //                     id: "updatefr3",
        //                     value: selectedItem.getProperty("ZUCC_EXPERT_FR_3"),
        //                     editable: true,
        //                 }),


        //             ],
        //         });
        //     }
        //     if (selectedItem != null) {
        //         sap.ui.getCore().byId("updatePopup").open();
        //     } else {
        //         MessageToast.show(that.geti18n("errorSelectFirst"));
        //         sap.ui.getCore().byId("updatePopup").destroy();
        //     }
        // },

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
                        .getModel("Labels")
                        .getProperty("/oDataUrl");
                    var oModel = new sap.ui.model.odata.v2.ODataModel(serviceURL);

                    var deleteLabel = parseInt(sap.ui.getCore().byId("deleteLabel").getValue());
                    var dPath = "/zcrm_label_map001Set(ZLABEL_ID=" + deleteLabel + ")";
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

            if (that.getView().byId("labelTable").getSelectedItem() != null) {
                var selectedItem = that
                    .getView()
                    .byId("labelTable")
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
            var serviceURL = this.getView().getModel("Labels").getProperty("/oDataUrl");
            var oModel = new sap.ui.model.odata.v2.ODataModel(serviceURL);
            this.getView().byId("labelTable").setModel(oModel);
        },

        onCancelSave: function () {

            this.oMultiEditDialog.close();
            this.oMultiEditDialog.destroy();
            this.oMultiEditDialog = null;
            MessageToast.show(this.geti18n("labelNotCreated"));
        },

        onUpdateSelectedLabel: function (oEvent) {
            var that = this;
            Fragment.load({
                name: "iService_UI5.fragment.editLabel",
                controller: this
            }).then(function (oFragment) {
                that.oMultiEditDialog = oFragment;
                that.getView().addDependent(that.oMultiEditDialog);

                that.oMultiEditDialog.setEscapeHandler(function () {
                    that.onCloseDialog();
                }.bind(this));

                that.oMultiEditDialog.getContent()[0].setContexts(that.getView().byId("labelTable").getTable().getSelectedContexts());

                that.oMultiEditDialog.open();
            }.bind(this));
        },

        onDialogSaveButton: function () {
            var oMultiEditContainer = this.oMultiEditDialog.getContent()[0];

            this.oMultiEditDialog.setBusy(true);
            oMultiEditContainer.getErroneousFieldsAndTokens().then(function (aErrorFields) {
                this.oMultiEditDialog.setBusy(false);
                if (aErrorFields.length === 0) {
                    this._saveChanges();
                }
            }.bind(this)).catch(function () {
                this.oMultiEditDialog.setBusy(false);
            }.bind(this));
        },
        _saveChanges: function () {
            var oMultiEditContainer = this.oMultiEditDialog.getContent()[0],
                that = this,
                aUpdatedContexts,
                oContext,
                oUpdatedData,
                oObjectToUpdate,
                oUpdatedDataCopy;

            var fnHandler = function (oField) {
                var sPropName = oField.getPropertyName(),
                    sUomPropertyName = oField.getUnitOfMeasurePropertyName();
                if (!oField.getApplyToEmptyOnly() || !oObjectToUpdate[sPropName]
                    || (typeof oObjectToUpdate[sPropName] == "string" && !oObjectToUpdate[sPropName].trim())) {
                    oUpdatedDataCopy[sPropName] = oUpdatedData[sPropName];
                }
                if (oField.isComposite()) {
                    if (!oField.getApplyToEmptyOnly() || !oObjectToUpdate[sUomPropertyName]) {
                        oUpdatedDataCopy[sUomPropertyName] = oUpdatedData[sUomPropertyName];
                    }
                }
            };

            MessageToast.show("Save action started", {
                onClose: function () {
                    oMultiEditContainer.getAllUpdatedContexts(true).then(function (result) {
                        MessageToast.show("Updated contexts available", {
                            onClose: function () {
                                aUpdatedContexts = result;
                                for (var i = 0; i < aUpdatedContexts.length; i++) {
                                    oContext = aUpdatedContexts[i].context;
                                    oUpdatedData = aUpdatedContexts[i].data;
                                    oObjectToUpdate = oContext.getModel().getObject(oContext.getPath());
                                    oUpdatedDataCopy = {};
                                    this._getFields().filter(function (oField) {
                                        return !oField.isKeepExistingSelected();
                                    }).forEach(fnHandler);
                                    oContext.getModel().update(oContext.getPath(), oUpdatedDataCopy);
                                }
                                MessageToast.show("Model was updated");

                                that.onCloseDialog();
                            }.bind(this)
                        });
                    }.bind(oMultiEditContainer));
                }
            });
            this.oMultiEditDialog.close();
        },

        onCreateLabel: function () {
            console.log("pressed");
            var that = this;
            // Step 1: Define JSONModel instance for new expert
            var oNewLabelModelData = {
                Label: {
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
                }
            };
            var oNewLabelModel = new JSONModel(oNewLabelModelData);
            this.getView().setModel(oNewLabelModel, "labelCreate");


            // Step 2: Load the Fragment
            if (!this.byId("newLabelDialog")) {
                Fragment.load({
                    id: this.getView().getId(),
                    name: "iService_UI5.fragment.createLabel",
                    controller: this
                }).then(function (oDialog) {
                    // Connect dialog to the root view of this component (models, lifecycle)
                    this.getView().addDependent(oDialog);

                    // Step 3: Set the model
                    oDialog.setModel(this.getView().getModel("labelCreate"), "labelCreate");



                    // Step 4: Open the dialog
                    oDialog.open();
                }.bind(this));
            } else {
                this.byId("newLabelDialog").open();
            }
        },

        onSaveLabel: function () {

            var that = this;
            // Step 1: Get the current data from the JSONModel instance
            // TODO: Change data according to expertCreate Model
            var oPayload = new JSONModel({
                "ZPRODUCT": this.getView().getModel("labelCreate").getProperty("/Label").ZPRODUCT,
                "ZUCC_EXPERT_MO_1": this.getView().getModel("labelCreate").getProperty("/Label").ZUCC_EXPERT_MO_1,
                "ZUCC_EXPERT_MO_2": this.getView().getModel("labelCreate").getProperty("/Label").ZUCC_EXPERT_MO_2,
                "ZUCC_EXPERT_MO_3": this.getView().getModel("labelCreate").getProperty("/Label").ZUCC_EXPERT_MO_3,
                "ZUCC_EXPERT_DI_1": this.getView().getModel("labelCreate").getProperty("/Label").ZUCC_EXPERT_DI_1,
                "ZUCC_EXPERT_DI_2": this.getView().getModel("labelCreate").getProperty("/Label").ZUCC_EXPERT_DI_2,
                "ZUCC_EXPERT_DI_3": this.getView().getModel("labelCreate").getProperty("/Label").ZUCC_EXPERT_DI_3,
                "ZUCC_EXPERT_MI_1": this.getView().getModel("labelCreate").getProperty("/Label").ZUCC_EXPERT_MI_1,
                "ZUCC_EXPERT_MI_2": this.getView().getModel("labelCreate").getProperty("/Label").ZUCC_EXPERT_MI_2,
                "ZUCC_EXPERT_MI_3": this.getView().getModel("labelCreate").getProperty("/Label").ZUCC_EXPERT_MI_3,
                "ZUCC_EXPERT_DO_1": this.getView().getModel("labelCreate").getProperty("/Label").ZUCC_EXPERT_DO_1,
                "ZUCC_EXPERT_DO_2": this.getView().getModel("labelCreate").getProperty("/Label").ZUCC_EXPERT_DO_2,
                "ZUCC_EXPERT_DO_3": this.getView().getModel("labelCreate").getProperty("/Label").ZUCC_EXPERT_DO_3,
                "ZUCC_EXPERT_FR_1": this.getView().getModel("labelCreate").getProperty("/Label").ZUCC_EXPERT_FR_1,
                "ZUCC_EXPERT_FR_2": this.getView().getModel("labelCreate").getProperty("/Label").ZUCC_EXPERT_FR_2,
                "ZUCC_EXPERT_FR_3": this.getView().getModel("labelCreate").getProperty("/Label").ZUCC_EXPERT_FR_3

            });


            console.log(this.getView().getModel("labelCreate").getProperty("/Label").ZPRODUCT);

            // Step 2: Get ODataModel instance and create new entity

            var serviceURL = this.getView().getModel("Labels").getProperty("/oDataUrl");
            var oModel = new sap.ui.model.odata.v2.ODataModel(serviceURL);
            oModel.create("/zcrm_label_map001Set", oPayload.oData, {
                success: function () {
                    console.log(oPayload.oData);
                    MessageToast.show("Label created successfully!");
                    that.onClear();
                    that.byId("newLabelDialog").close();
                }.bind(this),
                error: function () {
                    MessageToast.show("Error while creating the label.");
                }
            });
        },

        onCancelCreate: function () {
            var that = this;
            that.byId("newLabelDialog").close();
        },
    });
}
);
