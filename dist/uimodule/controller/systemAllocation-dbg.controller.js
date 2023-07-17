sap.ui.define(
  [
    "iService_UI5/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/m/ColumnListItem",
    "sap/m/Label",
    "sap/m/Token",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/FilterType",
    "sap/m/Dialog",
    "sap/m/Text",
    "sap/m/DialogType",
    "sap/m/Button",
    "sap/m/ButtonType",
  ],
  function (
    Controller,
    JSONModel,
    Fragment,
    MessageToast,
    MessageBox,
    ColumnListItem,
    Label,
    Token,
    Filter,
    FilterOperator,
    FilterType,
    Dialog,
    Text,
    DialogType,
    Button,
    ButtonType
  ) {
    "use strict";

    var oModel;
    var oFragment;
    var uniqueIdModel = new JSONModel();
    var mandant;

    return Controller.extend("iService_UI5.controller.systemAllocation", {
      inputId: "",

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
          that.getView().setModel(this, "Allocations");
          var serviceURL = that
            .getView()
            .getModel("Allocations")
            .getProperty("/oDataUrl");
          var oModel = new sap.ui.model.odata.v2.ODataModel(serviceURL);
          that.getView().setModel(oModel);
        });

        oSettingsModel.attachRequestCompleted(function () {
          var serviceURL = this.getProperty("/oDataUrl");
          var oModel = new sap.ui.model.odata.v2.ODataModel(serviceURL);
          oModel.setSizeLimit(100000000);
          var oView = that.getView();
          oView.setModel(oModel, "md");
          oView.setModel(
            new JSONModel({
              globalFilter: "",
            }),
            "ui"
          );

          that._oGlobalFilter = null;
          that._oStatusFilter = null;

        });
      },

      // open create fragment dialog
      onCreateAllocationDialog: function () {
        var that = this;
        var oView = this.getView();
        this.refreshAllocation();

        if (!this.pDialog) {

          this.pDialog = Fragment.load({
            id: oView.getId(),
            name: "iService_UI5.fragment.createAllocation",
            controller: this,
          }).then(function (oDialog) {
            // connect dialog to the root view of this component (models, lifecycle)
            oView.addDependent(oDialog);
            return oDialog;
          });
        }
        this.pDialog.then(function (oDialog) {
          oDialog.open();
          var oModel = oView.getModel();
          oModel.read("/GetContractsSet", {
            success: function (oData, oResponse) {

              var oPartnerSet = oData.results;
              var uniquePartnerIdSet = [];

              oPartnerSet.forEach((partner) => {

                if (!uniquePartnerIdSet.includes(partner.Partnerid)) {
                  uniquePartnerIdSet.push(partner.Partnerid);
                }
              });
              var jsonData = {
                items: uniquePartnerIdSet
              }

              var oComboBox = that.byId("PartnerId");
              var oModel = new sap.ui.model.json.JSONModel();
              oModel.setData(jsonData);
              oComboBox.setModel(oModel);
              oComboBox.bindAggregation("items",
                "/items", new sap.ui.core.ListItem({
                  text: "{}"
                }));
            },
            function(error) {

            },
          })
        });
      },

      // Delete selected allocation dialog and delete Request
      onDeleteSelectedAllocation: function () {
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
              .getModel("Allocations")
              .getProperty("/oDataUrl");
            var oModel = new sap.ui.model.odata.v2.ODataModel(serviceURL);

            var deletePartnerId = sap.ui
              .getCore()
              .byId("deletePartnerId")
              .getValue();
            var deleteInstallationsnummer = sap.ui
              .getCore()
              .byId("deleteInstallationsnummer")
              .getValue();
            var deleteMandant = sap.ui
              .getCore()
              .byId("deleteMandant")
              .getValue();
            var deleteSystemId = sap.ui
              .getCore()
              .byId("deleteSystemId")
              .getValue();
            var dPath =
              "/SystemzuordnungSet(PartnerId='" +
              deletePartnerId +
              "',Installationsnummer='" +
              deleteInstallationsnummer +
              "',Mandant='" +
              deleteMandant +
              "',SystemId='" +
              deleteSystemId +
              "')";

            oModel.remove(dPath, {
              method: "DELETE",
              success: function (oData, oResponse) {
                sap.m.MessageToast.show("Successfully deleted!");
                oModel.refresh();
                that.onClear();
                sap.ui.getCore().byId("deletePopup").destroy();
              },
              error: function (oError) {
                sap.m.MessageToast.show("Error during allocation deletion");
              },
            });
          },
        });

        if (that.getView().byId("allocationTable").getSelectedItem() != null) {
          var selectedItem = that
            .getView()
            .byId("allocationTable")
            .getSelectedItem()
            .getBindingContext();

          var oDialog = new sap.m.Dialog("deletePopup", {
            title: that.geti18n("deletePopupAllocation"),
            modal: true,
            resizable: true,
            contentWidth: "1em",
            buttons: [deleteButton, cancelButton],
            content: [
              new sap.m.Label({
                text: that.geti18n("partnerId"),
              }),
              new sap.m.Input({
                id: "deletePartnerId",
                value: selectedItem.getProperty("PartnerId"),
                editable: false,
              }),
              new sap.m.Label({
                text: that.geti18n("mandant"),
              }),
              new sap.m.Input({
                id: "deleteMandant",
                value: selectedItem.getProperty("Mandant"),
                editable: false,
              }),
              new sap.m.Label({
                text: that.geti18n("systemId"),
              }),
              new sap.m.Input({
                id: "deleteSystemId",
                value: selectedItem.getProperty("SystemId"),
                editable: false,
              }),
              new sap.m.Label({
                text: that.geti18n("installationsnummer"),
              }),
              new sap.m.Input({
                id: "deleteInstallationsnummer",
                value: selectedItem.getProperty("Installationsnummer"),
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

      // Update selected allocation dialog and update Request
      onUpdateSelectedAllocation: function () {
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
              .getModel("Allocations")
              .getProperty("/oDataUrl");
            var oModel = new sap.ui.model.odata.v2.ODataModel(serviceURL);
            var produktOptId;
            if (sap.ui.getCore().byId("updateProduktOptId").getSelectedItem() !== null) {
              produktOptId = parseInt(sap.ui.getCore().byId("updateProduktOptId").getSelectedItem().getKey());
            } else {
              produktOptId = parseInt(sap.ui.getCore().byId("updateProduktOptId").getValue());
            }

            var oUpdatedAllocation = {
              PartnerId: sap.ui.getCore().byId("updatePartnerId").getValue(),
              Installationsnummer: sap.ui
                .getCore()
                .byId("updateInstallationsnummer")
                .getValue(),
              Mandant: sap.ui.getCore().byId("updateMandant").getValue().split("-")[1],
              SystemId: sap.ui.getCore().byId("updateMandant").getValue().split("-")[0],
              ProduktOptId: produktOptId,
              SComment: sap.ui.getCore().byId("updateSComment").getValue(),
            };

            var updatePartnerId = selectedItem.getProperty("PartnerId");
            var updateInstallationsnummer = selectedItem.getProperty(
              "Installationsnummer"
            );
            var updateMandant = selectedItem.getProperty("Mandant");
            var updateSystemId = selectedItem.getProperty("SystemId");
            var updateProduktOptId = selectedItem.getProperty("ProduktOptId");
            var updateSComment = selectedItem.getProperty("SComment");
            var dPath =
              "/SystemzuordnungSet(PartnerId='" +
              updatePartnerId +
              "',Installationsnummer='" +
              updateInstallationsnummer +
              "',Mandant='" +
              updateMandant +
              "',SystemId='" +
              updateSystemId +
              "')";

            oModel.update(dPath, oUpdatedAllocation, {
              success: function (oData, oResponse) {
                sap.m.MessageToast.show("Successfully updated!");
                oModel.refresh();
                that.onClear();
                sap.ui.getCore().byId("updatePopup").destroy();
              },
              error: function (oError) {
                sap.m.MessageToast.show("Error during allocation update");
              },
            });
          },
        });

        if (that.getView().byId("allocationTable").getSelectedItem() != null) {
          var selectedItem = that
            .getView()
            .byId("allocationTable")
            .getSelectedItem()
            .getBindingContext();




          var oDialog = new sap.m.Dialog("updatePopup", { // TODO: updatePopUp making the updatePopUp adhering to UseCase2 
            title: that.geti18n("updatePopupAllocation"),
            modal: true,
            resizable: true,
            contentWidth: "25em",
            buttons: [updateButton, cancelButton],
            content: [
              new sap.m.Label({
                text: that.geti18n("partnerId"),
              }),
              new sap.m.Input({
                id: "updatePartnerId",
                value: selectedItem.getProperty("PartnerId"),
                editable: false,
              }),
              new sap.m.Label({
                text: that.geti18n("mandant"),
              }),
              new sap.m.ComboBox({
                id: "updateMandant",
                value: selectedItem.getProperty("Mandant"),
                editable: true,
                width: "100%"
              }),
              new sap.m.Label({
                text: that.geti18n("systemId"),
              }),
              new sap.m.Input({
                id: "updateSystemId",
                value: selectedItem.getProperty("SystemId"),
                editable: true,
              }),
              new sap.m.Label({
                text: that.geti18n("installationsnummer"),
              }),
              new sap.m.Input({
                id: "updateInstallationsnummer",
                value: selectedItem.getProperty("Installationsnummer"),
                editable: true,
              }),
              new sap.m.Label({
                text: that.geti18n("productOptId"),
              }),
              new sap.m.ComboBox({
                id: "updateProduktOptId",
                value: selectedItem.getProperty("ProduktOptId"),
                editable: true,
                width: "100%"
              }),
              new sap.m.Label({
                text: that.geti18n("comment"),
              }),
              new sap.m.TextArea({
                id: "updateSComment",
                value: selectedItem.getProperty("SComment"),
                editable: true,
                growing: true,
                maxLength: 300,
              }),
            ],
          });
        }
        if (selectedItem != null) {
          sap.ui.getCore().byId("updatePopup").open();

          var oView = that.getView();
          var oModel = oView.getModel();

          var query = "I02";
          oModel.read("/MandantSet", {
            urlParameters: {
              search: query
            },
            success: function (oData, oResponse) {

              var oMandant = oData.results;
              var jsonData = {
                items: oMandant
              };
              var updateMandantBox = sap.ui.getCore().byId("updateMandant");
              var updateMandantModel = new sap.ui.model.json.JSONModel();
              updateMandantModel.setData(jsonData);
              updateMandantBox.setModel(updateMandantModel);
              updateMandantBox.bindAggregation("items",
                "/items", new sap.ui.core.ListItem({

                  text: "{ID}"


                }));

            },
            error: function (oError) {

            },
          });

          oModel.read("/GetContractsSet", {
            success: function (oData, oResponse) {

              var oPartnerSet = oData.results;
              var productOptionPerPartner = [];
              var partnerId = selectedItem.getProperty("PartnerId");


              oPartnerSet.forEach((partner) => {


                if (partnerId === partner.Partnerid) {
                  productOptionPerPartner.push(partner);


                }
              });
              var jsonData = {
                items: productOptionPerPartner
              }

              var updateProdOptIdBox = sap.ui.getCore().byId("updateProduktOptId");
              var oModel = new sap.ui.model.json.JSONModel();
              oModel.setData(jsonData);
              updateProdOptIdBox.setModel(oModel);
              updateProdOptIdBox.bindAggregation("items",
                "/items", new sap.ui.core.ListItem({
                  key: "{Prodoptid}",
                  text: "{Poname} | {Pname}",

                }));

            },
            function(error) {

            },
          });


        } else {
          MessageToast.show(that.geti18n("errorSelectFirst"));
          sap.ui.getCore().byId("updatePopup").destroy();
        }
      },

      // Creation Fragment
      // Create request new allocation
      onCreateAllocation: function () {
        var that = this;
        var oMandant;
        var oProdOpt;
        var oSysId;
        var oPartnerId;
        var oInstallationsNr = "";

        var serviceURL = this.getView()
          .getModel("Allocations")
          .getProperty("/oDataUrl");
        var oModel = new sap.ui.model.odata.v2.ODataModel(serviceURL);
        var newAllocationPayload = this.getView() // model has to be set by onChange beforehand
          .getModel("allocationCreate")
          .getProperty("/Allocation");
        oPartnerId =
          this.byId("PartnerId").getSelectedItem().getText();

        if (this.byId("Mandant").getSelectedItem() !== null) {
          oMandant = this.byId("Mandant").getSelectedItem().getText().split("-")[1];
          oSysId = this.byId("Mandant").getSelectedItem().getText().split("-")[0];

        } else {
          oMandant = mandant.split("-")[1];
          oSysId = mandant.split("-")[0];
        }
        oProdOpt = this.byId("ProduktOptId").getSelectedItem().getKey();


        newAllocationPayload.Mandant = oMandant;
        newAllocationPayload.SystemId = oSysId;
        newAllocationPayload.ProduktOptId = parseInt(oProdOpt);
        newAllocationPayload.PartnerId = oPartnerId;







        oModel.create("/SystemzuordnungSet", newAllocationPayload, {
          success: function (oData, oResponse) {
            sap.m.MessageToast.show(that.geti18n("allocationCreated"));
            oModel.refresh();
            that.onClear();
            that.byId("createAllocationDialog").close();
          },
          error: function (oError) {
            sap.m.MessageToast.show(that.geti18n("allocationFailed"));
          },
        });
      },



      //function sets values of createAllocation Dialog 
      onChange: function (oEvent) {
        var that = this;
        var oView = this.getView();
        var partnerId = JSON.stringify(oEvent.getParameters().selectedItem.mProperties.text);
        var oModel = oView.getModel();
        oModel.read("/GetContractsSet", {
          success: function (oData, oResponse) {

            var oPartnerSet = oData.results;
            var productOptionPerPartner = [];

            oPartnerSet.forEach((partner) => {


              if (partnerId === JSON.stringify(partner.Partnerid)) {
                productOptionPerPartner.push(partner);

              }
            });
            var jsonData = {
              items: productOptionPerPartner
            }

            var oComboBox = that.byId("ProduktOptId");
            var oModel = new sap.ui.model.json.JSONModel();
            oModel.setData(jsonData);
            oComboBox.setModel(oModel);
            oComboBox.bindAggregation("items",
              "/items", new sap.ui.core.ListItem({
                key: "{Prodoptid}",
                text: "{Poname} | {Pname}",

              }));

          },
          function(error) {

          },
        });






      },

      fetchMandantenSet: function () {
        var that = this;
        var oView = this.getView();
        var oModel = oView.getModel();
        var query = "I02";
        oModel.read("/MandantSet", {
          urlParameters: {
            search: query
          },
          success: function (oData, oResponse) {

            var oMandant = oData.results;
            var jsonData = {
              items: oMandant
            }

            var firstItem = new sap.ui.core.Item({
              text: oMandant[0].ID
            })
            mandant = oMandant[0].ID;

            var oComboBox = that.byId("Mandant")
            var oModel = new sap.ui.model.json.JSONModel();
            oModel.setData(jsonData);
            oComboBox.setModel(oModel);
            oComboBox.setSelectedItem(firstItem);
            oComboBox.bindAggregation("items",
              "/items", new sap.ui.core.ListItem({

                text: "{ID}"


              }));

          },
          error: function (oError) {

          }
        });

      },

      // Cancel allocation creation
      onCancelAllocation: function () {
        this.byId("createAllocationDialog").close();
        MessageToast.show(this.geti18n("allocationNotCreated"));
      },

      // Value Help
      handleValueHelp: function (oEvent) {
        var sInputValue = oEvent.getSource().getValue();
        this.inputId = oEvent.getSource().getId();

        // create value help dialog
        if (!this._valueHelpDialog) {
          this._valueHelpDialog = sap.ui.xmlfragment(
            "iService_UI5.fragment.DialogHostedCustomers",
            this
          );
          this._valueHelpDialog.setModel(this.getView().getModel("md"), "md");
          this.getView().addDependent(this._valueHelpDialog);
        }

        // create a filter for the binding
        var oFilter = this.createFilter1(sInputValue);
        this._valueHelpDialog.getBinding("items").filter(oFilter);

        // open value help dialog filtered by the input value
        this._valueHelpDialog.open(sInputValue);
      },

      _handleValueHelpSearch: function (evt) {
        var sValue = evt.getParameter("value");
        var oFilter = this.createFilter1(sValue);

        evt.getSource().getBinding("items").filter([oFilter]);
      },

      createFilter1: function (sInputValue) {
        var oFilter = new Filter({
          path: "NAME1",
          operator: sap.ui.model.FilterOperator.Contains,
          value1: sInputValue,
        });

        return oFilter;
      },

      createFilter2: function (sInputValue) {
        var oFilter = new Filter({
          path: "NAME1",
          operator: sap.ui.model.FilterOperator.NotContains,
          value1: this.getView().byId("Name_1Input").getValue(),
        });

        return oFilter;
      },

      _handleValueHelpClose: function (evt) {
        var oSelectedItem = evt.getParameter("selectedItem");
        if (oSelectedItem) {
          var productInput = this.byId(this.inputId);
          productInput.setValue(oSelectedItem.getTitle());
        }
        evt.getSource().getBinding("items").filter([]);
      },

      // Clear data
      onClear: function () {
        var that = this;
        var serviceURL = this.getView()
          .getModel("Allocations")
          .getProperty("/oDataUrl");
        var oModel = new sap.ui.model.odata.v2.ODataModel(serviceURL);
        this.getView().byId("allocationTable").setModel(oModel);
        var prodOptBox = that.byId("ProduktOptId");
        var mandantBox = that.byId("Mandant");
        if (prodOptBox !== undefined) {

          prodOptBox.setSelectedItem(null);
          mandantBox.setSelectedItem(null);
        } else {
          //nothing
        }
      },

      // Clear allocation model
      refreshAllocation: function () {
        var newAllocationPayload = this.getView()
          .getModel("allocationCreate")
          .getProperty("/Allocation");
        newAllocationPayload.PartnerId = "";
        newAllocationPayload.Mandant = "";
        newAllocationPayload.SystemId = "";
        newAllocationPayload.Installationsnummer = "";
        newAllocationPayload.ProduktOptId = "";
        newAllocationPayload.SComment = "";
      },

      // Filter allocation
      onFilterAllocation: function (oEvent) {
        var query = oEvent.getParameter("query");
        var oList = this.getView().byId("allocationTable");
        var oBindingInfo = oList.getBindingInfo("items"); // or "rows"

        if (!oBindingInfo.parameters) {
          oBindingInfo.parameters = {};
        }
        if (!oBindingInfo.parameters.custom) {
          oBindingInfo.parameters.custom = {};
        }
        oBindingInfo.parameters.custom.search = query;
        oList.bindItems(oBindingInfo);
      },
      onNotesPressed: function (event) {
        const notes = event
          .getSource()
          .getParent()
          .getBindingContext()
          .getProperty("SComment");

        this.notesDialog = new Dialog({
          type: DialogType.Message,
          title: "Notes",
          content: new Text({ text: notes }),
          beginButton: new Button({
            type: ButtonType.Emphasized,
            text: "OK",
            press: function () {
              this.notesDialog.close();
            }.bind(this),
          }),
        });
        this.notesDialog.open();
      },
    });
  }
);
