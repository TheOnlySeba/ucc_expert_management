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
            var oTable;

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
                oTable = that.getView().byId("expertTable").getTable();
                oTable.setMode("SingleSelect");
                oTable.attachSelectionChange(that.onTableSelection(), this);
                var aItems = that.getView().byId("expertTable").getTable().getItems();
                console.log(aItems);

                aItems.forEach(function (oItem) {
                    var oCell = oItem.getCells()[0];
                    console.log(oItem.getCells()[0]);
                    var oValue = oCell.getText();
                    oCell.setTex(this.availabilityFormatter(oValue));
                }, this);
            });

        },
        geti18n: function (sKey) {
            return this.getView().getModel("i18n").getResourceBundle().getText(sKey);
        },

        onTableSelection: function () {
            var that = this;
            var aSelectedItems = that.getView().byId("expertTable").getTable().getSelectedItems();

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
        onCancelCreate: function () {
            var that = this;
            that.byId("newExpertDialog").close();
        },

        onCancelSave: function () {
            // var that = this;
            // that.byId("newExpertDialog").close();
            // MessageToast.show(this.geti18n("expertNotCreated"));
            this.oMultiEditDialog.close();
            this.oMultiEditDialog.destroy();
            this.oMultiEditDialog = null;
        },

        onUpdateSelectedExpert: function () {


            var that = this;
            Fragment.load({
                name: "iService_UI5.fragment.editExpert",
                controller: this
            }).then(function (oFragment) {
                that.oMultiEditDialog = oFragment;
                that.getView().addDependent(that.oMultiEditDialog);

                that.oMultiEditDialog.setEscapeHandler(function () {
                    that.onCloseDialog();
                }.bind(this));

                that.oMultiEditDialog.getContent()[0].setContexts(that.getView().byId("expertTable").getTable().getSelectedContexts());

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

                                that.onCancelSave();
                            }.bind(this)
                        });
                    }.bind(oMultiEditContainer));
                }
            });
            this.oMultiEditDialog.close();
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

        onDeleteSelectedExpert: function () {
            var that = this;
            Fragment.load({
                name: "iService_UI5.fragment.deleteExpert",
                controller: this
            }).then(function (oFragment) {
                that.oMultiDeleteDialog = oFragment;
                that.getView().addDependent(that.oMultiDeleteDialog);

                that.oMultiDeleteDialog.setEscapeHandler(function () {
                    that.onCloseDialog();
                }.bind(this));

                that.oMultiDeleteDialog.getContent()[0].setContexts(that.getView().byId("expertTable").getTable().getSelectedContexts());

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

        availabilityFormatter: function (sValue) {
            return sValue === 1 ? "Available" : "Not Available";
        },

    });
}
);
