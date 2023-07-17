sap.ui.define([
    "iService_UI5/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function (Controller, JSONModel, Fragment, MessageToast, MessageBox) {
    "use strict";

    return Controller.extend("iService_UI5.controller.productOverview", {

        getRouter: function () {
            return sap.ui.core.UIComponent.getRouterFor(this);
        },

        // Get internationalization i18n file
        geti18n: function (sKey) {
            return this.getView().getModel("i18n").getResourceBundle().getText(sKey);
        },

        onInit: function () {
            var sPath = $.sap.getModulePath("iService_UI5", "/model/applicationProperties.json");
            var that = this;

            var oSettingsModel = new sap.ui.model.json.JSONModel();
            oSettingsModel.loadData(sPath);
            oSettingsModel.attachRequestCompleted(function () {
                that.getView().setModel(this, "Products");
                var serviceURL = that.getView().getModel("Products").getProperty("/oDataUrl");
                var oModel = new sap.ui.model.odata.v2.ODataModel(serviceURL);
                that.getView().setModel(oModel);
            });
        },

        onDeleteSelectedProduct: function () {
            var that = this;
            var cancelButton = new sap.m.Button({
                text: that.geti18n("cancelBtn"),
                type: sap.m.ButtonType.Default,
                press: function () {
                    sap.ui.getCore().byId("deletePopup").destroy();
                }
            });
            var deleteButton = new sap.m.Button({
                text: that.geti18n("deleteBtn"),
                type: sap.m.ButtonType.Reject,
                press: function () {
                    var serviceURL = that.getView().getModel("Products").getProperty("/oDataUrl");
                    var oModel = new sap.ui.model.odata.v2.ODataModel(serviceURL);

                    var deleteId = parseInt(sap.ui.getCore().byId("deleteId").getValue());
                    var deletePName = sap.ui.getCore().byId("deletePName").getValue();
                    var dPath = "/ProduktSet(Id=" + deleteId + ")";

                    oModel.remove(dPath, {
                        method: "DELETE",
                        success: function (oData, oResponse) {
                            sap.m.MessageToast.show("Successfully deleted!");
                            oModel.refresh();
                            that.onClear();
                            sap.ui.getCore().byId("deletePopup").destroy();
                        },
                        error: function (oError) {
                            sap.m.MessageToast.show("Error during product deletion");
                        }
                    });
                }
            });

            if (that.getView().byId("productTable").getSelectedItem() != null) {
                var selectedItem = that.getView().byId("productTable").getSelectedItem().getBindingContext();


                var oDialog = new sap.m.Dialog("deletePopup", {
                    title: that.geti18n("deletePopupProduct"),
                    modal: true,
                    contentWidth: "1em",
                    buttons: [deleteButton, cancelButton],
                    content: [
                        new sap.m.Label({
                            text: that.geti18n("Id")
                        }),
                        new sap.m.Input({
                            id: "deleteId",
                            value: selectedItem.getProperty("Id"),
                            editable: false
                        }),
                        new sap.m.Label({
                            text: that.geti18n("PName")
                        }),
                        new sap.m.Input({
                            id: "deletePName",
                            value: selectedItem.getProperty("PName"),
                            editable: false
                        })
                    ]
                });
            }
            if (selectedItem != null) {
                sap.ui.getCore().byId("deletePopup").open();
            } else {
                sap.m.MessageToast.show(that.geti18n("errorSelectFirst"));
                sap.ui.getCore().byId("deletePopup").destroy();
            }
        },

        // Update selected product dialog and update Request
        onUpdateSelectedProduct: function () {
            var that = this;
            var cancelButton = new sap.m.Button({
                text: that.geti18n("cancelBtn"),
                type: sap.m.ButtonType.Default,
                press: function () {
                    sap.ui.getCore().byId("updatePopup").destroy();
                }
            });
            var updateButton = new sap.m.Button({
                text: that.geti18n("updateBtn"),
                type: sap.m.ButtonType.Accept,
                press: function () {
                    var serviceURL = that.getView().getModel("Products").getProperty("/oDataUrl");
                    var oModel = new sap.ui.model.odata.v2.ODataModel(serviceURL);

                    var oUpdatedProduct = {
                        "Id": parseInt(sap.ui.getCore().byId("updateId").getValue()),
                        "PName": sap.ui.getCore().byId("updatePName").getValue()
                    };

                    var updateId = selectedItem.getProperty("Id");
                    var updatePName = selectedItem.getProperty("PName");
                    var dPath = "/ProduktSet(Id=" + updateId + ")";

                    oModel.update(dPath, oUpdatedProduct, {
                        success: function (oData, oResponse) {
                            sap.m.MessageToast.show("Successfully updated!");
                            oModel.refresh();
                            that.onClear();
                            sap.ui.getCore().byId("updatePopup").destroy();
                        },
                        error: function (oError) {
                            sap.m.MessageToast.show("Error during product update");
                        }
                    });
                }
            });

            if (that.getView().byId("productTable").getSelectedItem() != null) {
                var selectedItem = that.getView().byId("productTable").getSelectedItem().getBindingContext();


                var oDialog = new sap.m.Dialog("updatePopup", {
                    title: that.geti18n("updatePopupProduct"),
                    modal: true,
                    contentWidth: "1em",
                    buttons: [updateButton, cancelButton],
                    content: [
                        new sap.m.Label({
                            text: that.geti18n("Id")
                        }),
                        new sap.m.Input({
                            id: "updateId",
                            value: selectedItem.getProperty("Id"),
                            editable: false
                        }),
                        new sap.m.Label({
                            text: that.geti18n("PName")
                        }),
                        new sap.m.Input({
                            id: "updatePName",
                            value: selectedItem.getProperty("PName"),
                            editable: true
                        })
                    ]
                });
            }
            if (selectedItem != null) {
                sap.ui.getCore().byId("updatePopup").open();
            } else {
                MessageToast.show(that.geti18n("errorSelectFirst"));
                sap.ui.getCore().byId("updatePopup").destroy();
            }
        },

        onClear: function () {
            var serviceURL = this.getView().getModel("Products").getProperty("/oDataUrl");
            var oModel = new sap.ui.model.odata.v2.ODataModel(serviceURL);
            this.getView().byId("productTable").setModel(oModel);
        },

        onCreateProduct: function () {
            var that = this;

            var cancelButton = new sap.m.Button({
                text: that.geti18n("cancelBtn"),
                type: sap.m.ButtonType.Reject,
                press: function () {
                    sap.ui.getCore().byId("Popup").destroy();
                }
            });

            var saveButton = new sap.m.Button({
                text: that.geti18n("createBtn"),
                type: sap.m.ButtonType.Accept,
                press: function () {
                    var serviceURL = that.getView().getModel("Settings").getProperty("/oDataUrl");
                    var oModel = new sap.ui.model.odata.v2.ODataModel(serviceURL);
                    var oNewProduct = {
                        PName: sap.ui.getCore().byId("PName").getValue()
                    };

                    oModel.create("/ProduktSet", oNewProduct, {
                        success: function (oData, oResponse) {
                            sap.m.MessageToast.show("Product successfully created!");
                            oModel.refresh();
                            that.onClear();
                            sap.ui.getCore().byId("Popup").destroy();
                        },
                        error: function (oError) {
                            sap.m.MessageToast.show("Error during product creation!");
                        }
                    });
                }
            });

            var oDialog = new sap.m.Dialog("Popup", {
                title: that.geti18n("createPopupProduct"),
                modal: true,
                contentWidth: "1em",
                buttons: [saveButton, cancelButton],
                content: [
                    new sap.m.Label({
                        text: that.geti18n("PName")
                    }), new sap.m.Input({
                        id: "PName"
                    })]
            });
            sap.ui.getCore().byId("Popup").open();
        }

    });
});