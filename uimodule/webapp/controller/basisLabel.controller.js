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


            console.log(this.getView().getModel("basisLabelCreate").getProperty("/BasisLabel").ZPRODUCT);

            // Step 2: Get ODataModel instance and create new entity

            var serviceURL = this.getView().getModel("basisLabels").getProperty("/oDataUrl");
            var oModel = new sap.ui.model.odata.v2.ODataModel(serviceURL);
            oModel.create("/zcrm_basis_labelSet", oPayload.oData, {
                success: function () {
                    console.log(oPayload.oData);
                    MessageToast.show("Label created successfully!");
                    that.onClear();
                    that.byId("newBasisLabelDialog").close();
                }.bind(this),
                error: function () {
                    MessageToast.show("Error while creating the label.");
                }
            });
        },

        onCancelCreate: function () {
            var that = this;
            that.byId("newBasisLabelDialog").close();
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
                name: "iService_UI5.fragment.editBasisLabel",
                controller: this
            }).then(function (oFragment) {
                that.oMultiEditDialog = oFragment;
                that.getView().addDependent(that.oMultiEditDialog);

                that.oMultiEditDialog.setEscapeHandler(function () {
                    that.onCloseDialog();
                }.bind(this));

                that.oMultiEditDialog.getContent()[0].setContexts(that.getView().byId("basisLabelTable").getTable().getSelectedContexts());

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


        // onDeleteSelectedLabel: function () {

        //     var that = this;


        //     var cancelButton = new sap.m.Button({
        //         text: that.geti18n("cancel"),
        //         type: sap.m.ButtonType.Default,
        //         press: function () {
        //             sap.ui.getCore().byId("deletePopup").destroy();
        //         },
        //     });

        //     var deleteButton = new sap.m.Button({
        //         text: that.geti18n("delete"),
        //         type: sap.m.ButtonType.Reject,
        //         press: function () {
        //             var serviceURL = that
        //                 .getView()
        //                 .getModel("basisLabels")
        //                 .getProperty("/oDataUrl");
        //             var oModel = new sap.ui.model.odata.v2.ODataModel(serviceURL);

        //             var deleteLabel = parseInt(sap.ui.getCore().byId("deleteLabel").getValue());
        //             var dPath = "/zcrm_basis_labelSet(ZLABEL_ID=" + deleteLabel + ")";
        //             oModel.remove(dPath, {
        //                 success: function () {
        //                     MessageToast.show("Successfully deleted");
        //                     oModel.refresh();
        //                     that.onClear();
        //                     sap.ui.getCore().byId("deletePopup").destroy();

        //                 },
        //                 error: function () {
        //                     MessageToast.show("Error during Expert deletion");
        //                 },
        //             });
        //         },
        //     });

        //     if (that.getView().byId("basisLabelTable").getTable().getSelectedContexts() != null) {
        //         var selectedItem = that.getView().byId("basisLabelTable").getTable().getSelectedContexts();

        //         var oDialog = new Dialog("deletePopup", {
        //             title: that.geti18n("deletePopupLabel"),
        //             modal: true,
        //             contentWidth: "1em",
        //             buttons: [deleteButton, cancelButton],
        //             content: [
        //                 new sap.m.Label({
        //                     text: that.geti18n("label"),
        //                 }),
        //                 new sap.m.Input({
        //                     id: "deleteLabel",
        //                     value: selectedItem.getProperty("ZLABEL_ID"),
        //                     editable: false,
        //                 }),
        //             ],
        //         });
        //     }
        //     if (selectedItem != null) {
        //         sap.ui.getCore().byId("deletePopup").open();
        //     } else {
        //         MessageToast.show(that.geti18n("errorSelectFirst"));
        //         sap.ui.getCore().byId("deletePopup").destroy();
        //     }
        // },

        onDeleteSelectedLabel: function () {
            var that = this;
            Fragment.load({
                name: "iService_UI5.fragment.deleteBasisLabel",
                controller: this
            }).then(function (oFragment) {
                that.oMultiDeleteDialog = oFragment;
                that.getView().addDependent(that.oMultiDeleteDialog);

                that.oMultiDeleteDialog.setEscapeHandler(function () {
                    that.onCloseDialog();
                }.bind(this));

                that.oMultiDeleteDialog.getContent()[0].setContexts(that.getView().byId("basisLabelTable").getTable().getSelectedContexts());

                that.oMultiDeleteDialog.open();
            }.bind(this));
        },

        onDialogDeleteButton: function () {
            var oMultiDeleteContainer = this.oMultiDeleteDialog.getContent()[0];

            this.oMultiDeleteDialog.setBusy(true);
            oMultiDeleteContainer.getErroneousFieldsAndTokens().then(function (aErrorFields) {
                this.oMultiDeleteDialog.setBusy(false);
                if (aErrorFields.length === 0) {
                    this._delete();
                }
            }.bind(this)).catch(function () {
                this.oMultiDeleteDialog.setBusy(false);
            }.bind(this));
        },
        _delete: function () {
            var oMultiDeleteContainer = this.oMultiDeleteDialog.getContent()[0],
                that = this,
                aDeleteContexts,
                oContext;
            MessageToast.show("Delete action started", {
                onClose: function () {
                    oMultiDeleteContainer.getAllUpdatedContexts(true).then(function (result) {
                        MessageToast.show("Delete contexts available", {
                            onClose: function () {
                                aDeleteContexts = result;
                                for (var i = 0; i < aDeleteContexts.length; i++) {
                                    oContext = aDeleteContexts[i].context;

                                    oContext.getModel().remove(oContext.getPath());
                                }
                                MessageToast.show("Model was updated");

                                that.onCancelDelete();
                            }.bind(this)
                        });
                    }.bind(oMultiDeleteContainer));
                }
            });
            this.oMultiDeleteDialog.close();

        },

        onCancelDelete: function () {
            this.oMultiDeleteDialog.close();
            this.oMultiDeleteDialog.destroy();
            this.oMultiDeleteDialog = null;
        },

        onClear: function () {
            var serviceURL = this.getView().getModel("basisLabels").getProperty("/oDataUrl");
            var oModel = new sap.ui.model.odata.v2.ODataModel(serviceURL);
            this.getView().byId("basisLabelTable").setModel(oModel);
        },
    });
}
);
