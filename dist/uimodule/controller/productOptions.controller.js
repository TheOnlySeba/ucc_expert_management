sap.ui.define(
  [
    "iService_UI5/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
  ],
  function (Controller, JSONModel, Fragment, MessageToast, MessageBox) {
    "use strict";

    return Controller.extend("iService_UI5.controller.productOptions", {
      getRouter: function () {
        return sap.ui.core.UIComponent.getRouterFor(this);
      },

      // Get internationalization i18n file
      geti18n: function (sKey) {
        return this.getView()
          .getModel("i18n")
          .getResourceBundle()
          .getText(sKey);
      },

      onInit: function () {
        var sPath = $.sap.getModulePath(
          "iService_UI5",
          "/model/applicationProperties.json"
        );
        var that = this;

        var oSettingsModel = new sap.ui.model.json.JSONModel();
        oSettingsModel.loadData(sPath);
        oSettingsModel.attachRequestCompleted(function () {
          that.getView().setModel(this, "Productoptions");
          var serviceURL = that
            .getView()
            .getModel("Productoptions")
            .getProperty("/oDataUrl");
          var oModel = new sap.ui.model.odata.v2.ODataModel(serviceURL);
          that.getView().setModel(oModel);
        });
      },

      onDeleteSelectedProductOption: function () {
        var that = this;
        var cancelButton = new sap.m.Button({
          text: that.geti18n("cancelBtn"),
          type: sap.m.ButtonType.Default,
          press: function () {
            sap.ui.getCore().byId("deletePopup").destroy();
          },
        });
        var deleteButton = new sap.m.Button({
          text: that.geti18n("deleteBtn"),
          type: sap.m.ButtonType.Reject,
          press: function () {
            var serviceURL = that
              .getView()
              .getModel("Productoptions")
              .getProperty("/oDataUrl");
            var oModel = new sap.ui.model.odata.v2.ODataModel(serviceURL);

            var deleteId = parseInt(
              sap.ui.getCore().byId("deleteId").getValue()
            );
            var deletePoname = sap.ui.getCore().byId("deletePoname").getValue();
            var deleteProductid = parseInt(
              sap.ui.getCore().byId("deleteProductid").getValue()
            );
            var dPath = "/ProduktOptionSet(Id=" + deleteId + ")";

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
              },
            });
          },
        });

        if (
          that.getView().byId("productOptionTable").getSelectedItem() != null
        ) {
          var selectedItem = that
            .getView()
            .byId("productOptionTable")
            .getSelectedItem()
            .getBindingContext();

          var oDialog = new sap.m.Dialog("deletePopup", {
            title: that.geti18n("deletePopupProductOption"),
            modal: true,
            contentWidth: "1em",
            buttons: [deleteButton, cancelButton],
            content: [
              new sap.m.Label({
                text: that.geti18n("Id"),
              }),
              new sap.m.Input({
                id: "deleteId",
                value: selectedItem.getProperty("Id"),
                editable: false,
              }),
              new sap.m.Label({
                text: that.geti18n("PName"),
              }),
              new sap.m.Input({
                id: "deletePoname",
                value: selectedItem.getProperty("Poname"),
                editable: false,
              }),
              new sap.m.Label({
                text: that.geti18n("ProductId"),
              }),
              new sap.m.Input({
                id: "deleteProductid",
                value: selectedItem.getProperty("ProductId"),
                editable: false,
              }),
            ],
          });
        }
        if (selectedItem != null) {
          sap.ui.getCore().byId("deletePopup").open();
        } else {
          sap.m.MessageToast.show(that.geti18n("errorSelectFirst"));
          sap.ui.getCore().byId("deletePopup").destroy();
        }
      },

      // Update selected product option dialog and update Request
      onUpdateSelectedProductOption: function () {
        var that = this;
        var cancelButton = new sap.m.Button({
          text: that.geti18n("cancelBtn"),
          type: sap.m.ButtonType.Default,
          press: function () {
            sap.ui.getCore().byId("updatePopup").destroy();
          },
        });
        var updateButton = new sap.m.Button({
          text: that.geti18n("updateBtn"),
          type: sap.m.ButtonType.Accept,
          press: function () {
            var serviceURL = that
              .getView()
              .getModel("Productoptions")
              .getProperty("/oDataUrl");
            var oModel = new sap.ui.model.odata.v2.ODataModel(serviceURL);

            var oUpdatedProduct = {
              Id: parseInt(sap.ui.getCore().byId("updateId").getValue()),
              Poname: sap.ui.getCore().byId("updatePoname").getValue(),
              ProductId: parseInt(
                sap.ui.getCore().byId("updateProductid").getValue()
              ),
            };

            var updateId = selectedItem.getProperty("Id");
            var updatePoname = selectedItem.getProperty("Poname");
            var updateProductid = selectedItem.getProperty("ProductId");
            var dPath = "/ProduktOptionSet(Id=" + updateId + ")";

            oModel.update(dPath, oUpdatedProduct, {
              success: function (oData, oResponse) {
                sap.m.MessageToast.show("Successfully updated!");
                oModel.refresh();
                that.onClear();
                sap.ui.getCore().byId("updatePopup").destroy();
              },
              error: function (oError) {
                sap.m.MessageToast.show("Error during product update");
              },
            });
          },
        });

        if (
          that.getView().byId("productOptionTable").getSelectedItem() != null
        ) {
          var selectedItem = that
            .getView()
            .byId("productOptionTable")
            .getSelectedItem()
            .getBindingContext();

          var oDialog = new sap.m.Dialog("updatePopup", {
            title: that.geti18n("updatePopupProductOption"),
            modal: true,
            contentWidth: "1em",
            buttons: [updateButton, cancelButton],
            content: [
              new sap.m.Label({
                text: that.geti18n("Id"),
              }),
              new sap.m.Input({
                id: "updateId",
                value: selectedItem.getProperty("Id"),
                editable: false,
              }),
              new sap.m.Label({
                text: that.geti18n("Poname"),
              }),
              new sap.m.Input({
                id: "updatePoname",
                value: selectedItem.getProperty("Poname"),
                editable: true,
              }),
              new sap.m.Label({
                text: that.geti18n("ProductId"),
              }),
              new sap.m.Input({
                id: "updateProductid",
                value: selectedItem.getProperty("ProductId"),
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

      onClear: function () {
        var serviceURL = this.getView()
          .getModel("Productoptions")
          .getProperty("/oDataUrl");
        var oModel = new sap.ui.model.odata.v2.ODataModel(serviceURL);
        this.getView().byId("productOptionTable").setModel(oModel);
      },

      onCreateProductOption: function () {
        var that = this;

        var cancelButton = new sap.m.Button({
          text: that.geti18n("cancelBtn"),
          type: sap.m.ButtonType.Reject,
          press: function () {
            sap.ui.getCore().byId("Popup").destroy();
          },
        });

        var saveButton = new sap.m.Button({
          text: that.geti18n("createBtn"),
          type: sap.m.ButtonType.Accept,
          press: function () {
            var serviceURL = that
              .getView()
              .getModel("Settings")
              .getProperty("/oDataUrl");
            var oModel = new sap.ui.model.odata.v2.ODataModel(serviceURL);
            var oNewProductOption = {
              Poname: sap.ui.getCore().byId("Poname").getValue(),
              ProductId: parseInt(
                sap.ui.getCore().byId("ProductId").getValue()
              ),
            };

            oModel.create("/ProduktOptionSet", oNewProductOption, {
              success: function (oData, oResponse) {
                sap.m.MessageToast.show("Product Option successfully created!");
                oModel.refresh();
                that.onClear();
                sap.ui.getCore().byId("Popup").destroy();
              },
              error: function (oError) {
                sap.m.MessageToast.show(
                  "Error during product option creation!"
                );
              },
            });
          },
        });

        var oDialog = new sap.m.Dialog("Popup", {
          title: that.geti18n("createPopupProductOption"),
          modal: true,
          contentWidth: "1em",
          buttons: [saveButton, cancelButton],
          content: [
            new sap.m.Label({
              text: that.geti18n("Poname"),
            }),
            new sap.m.Input({
              id: "Poname",
            }),
            new sap.m.Label({
              text: that.geti18n("ProductId"),
            }),
            new sap.m.Input({
              id: "ProductId",
            }),
          ],
        });
        sap.ui.getCore().byId("Popup").open();
      },
    });
  }
);
