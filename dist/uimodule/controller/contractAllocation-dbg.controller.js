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
        var tmpPayload;
        var multipleProOptIds = false;
        var tmpDialog;
        var closeDialog;
        var prodOptIds = [];

        return Controller.extend("iService_UI5.controller.contractAllocation", {
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
                    that.getView().setModel(this, "Contracts");
                    var serviceURL = that
                        .getView()
                        .getModel("Contracts")
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

            onFilterContract: function (oEvent) {
                var query = oEvent.getParameter("query");
                var oList = this.getView().byId("contractTable");
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


            bindDataToTable: function (oData) {
                var oTable = this.getView().byId("contractTable");
                var searchQuery = [];
                var oModel = new JSONModel();
                oData.results.forEach(function (oDataPiece) {
                    searchQuery.push({
                        "Contrid": oDataPiece.Contrid,
                        "Name_org1": oDataPiece.Name_org1,
                        "Partnerid": oDataPiece.Partnerid,
                        "Prodoptid": oDataPiece.Prodoptid,
                        "Contrabegin": oDataPiece.Contrabegin,
                        "Contraend": oDataPiece.Contraend,
                        "Ucccontact_main": oDataPiece.Ucccontact_main,
                        "Price": oDataPiece.Price,
                        "Poname": oDataPiece.Poname
                    });
                });
                oModel.setData({
                    searchQuery: searchQuery
                });
                oTable.setModel(oModel);
                oTable.bindRows("/searchQuery");
            },



            onNotesPressed: function (event) {
                const notes = event
                    .getSource()
                    .getParent()
                    .getBindingContext()
                    .getProperty("Internalcomment");

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

            onCreateContractDialog: function () {
                var oView = this.getView();
                this.refreshContract();

                if (!this.pDialog) {

                    this.pDialog = Fragment.load({
                        id: oView.getId(),
                        name: "iService_UI5.fragment.createContract",
                        controller: this,
                    }).then(function (oDialog) {
                        // connect dialog to the root view of this component (models, lifecycle)
                        oView.addDependent(oDialog);
                        return oDialog;
                    });
                }
                this.pDialog.then(function (oDialog) {
                    oDialog.open();

                });

            },

            onAddProdOptId: function () {
                var oView = this.getView();

                if (!this.pDialog) {

                    this.pDialog = Fragment.load({
                        id: oView.getId(),
                        name: "iService_UI5.fragment.addProdOptId",
                        controller: this,
                    }).then(function (oDialog) {
                        // connect dialog to the root view of this component (models, lifecycle)
                        oView.addDependent(oDialog);
                        return oDialog;
                    });
                }
                this.pDialog.then(function (oDialog) {
                    oDialog.open();
                });
            },

            refreshContract: function () {
                var newContractPayload = this.getView()
                    .getModel("contractCreate")
                    .getProperty("/Contract");
                newContractPayload.Partnerid = "";
                newContractPayload.Prodoptid = "";
                newContractPayload.Contrabegin = "";
                newContractPayload.Contraend = "";
                newContractPayload.Ucccontact = "";
                newContractPayload.Internalcomment = "";
            },

            getDialog: function () {
                var oView = this.getView();

                if (!this.oDialog) {

                    this.oDialog = Fragment.load({
                        id: "addProdOptDialog",
                        name: "iService_UI5.fragment.addProdOptId",
                        controller: this,
                    }).then(function (oDialog) {
                        // connect dialog to the root view of this component (models, lifecycle)
                        oView.addDependent(oDialog);
                        return oDialog;
                    });
                }


                this.oDialog.then(function (oDialog) {
                    oDialog.open();
                });


            },

            getProdOptIds: function (oEvent) {
                var ids = oEvent.getParameters();

                ids.selectedItems.forEach(id => {
                    if (!prodOptIds.includes(id.mProperties)) {

                        prodOptIds.push(id.mProperties);
                    }
                });

            },

            callBackend: async function (oPayload) {
                var that = this;
                var serviceURL = this.getView()
                    .getModel("Contracts")
                    .getProperty("/oDataUrl");
                var oModel = new sap.ui.model.odata.v2.ODataModel(serviceURL);

                oModel.create("/ContractSet", oPayload, {
                    success: function (oData, oResponse) {
                        sap.m.MessageToast.show(that.geti18n("contractCreated"));
                        oModel.refresh();
                        that.onClear();
                        that.byId("createContractDialog").close();
                        //end if statement for multiple prodopt ids
                        //check if multiple prodops have been added successfully and 


                    },
                    error: function (oError) {
                        sap.m.MessageToast.show(that.geti18n("contractFailed"));
                    },
                });

            },

            sleep: function (milliseconds) {
                return new Promise(resolve => setTimeout(resolve, milliseconds))
            },


            onCreateContract: async function () {

                for (var i = 0; i < prodOptIds.length; i++) {
                    var contractPayload = new JSONModel({
                        "Contrid": 0,
                        "Prodoptid": parseInt(prodOptIds[i].key),
                        "Partnerid": this.getView()
                            .getModel("contractCreate")
                            .getProperty("/Contract").Partnerid,
                        "Internalcomment": this.getView()
                            .getModel("contractCreate")
                            .getProperty("/Contract").Internalcomment,
                        "Contrabegin": this.getView()
                            .getModel("contractCreate")
                            .getProperty("/Contract").Contrabegin,
                        "Contraend": this.getView()
                            .getModel("contractCreate")
                            .getProperty("/Contract").Contraend,
                        "Ucccontact_main": this.getView()
                            .getModel("contractCreate")
                            .getProperty("/Contract").Ucccontact_main
                    });
                    await this.callBackend(contractPayload.oData);
                    await this.sleep(1000); // we have to do this here in order to prevent batch problems at SAP GW

                };
            },





            onAddPrdOpt: function (event) {

                var that = this;
                var source = event.getSource().getParent();

                var serviceURL = this.getView()
                    .getModel("Contracts")
                    .getProperty("/oDataUrl");

                var oModel = new sap.ui.model.odata.v2.ODataModel(serviceURL);
                var newContractPayload = tmpPayload;
                newContractPayload.Prodoptid = parseInt(this.getView()
                    .getModel("contractCreate")
                    .getProperty("/Contract").Prodoptid);

                oModel.create("/ContractSet", newContractPayload, {
                    success: function () {
                        sap.m.MessageToast.show(that.geti18n("anotherContractCreated"));
                        oModel.refresh();
                        that.onClear();
                        source.close();







                    },
                    error: function () {
                        sap.m.MessageToast.show(that.geti18n("anotherContractFailed"));

                    },
                });
            },

            onSelectMultipleProdOpts: function (event) {
                if (event.getSource().getSelected()) {
                    multipleProOptIds = true;
                } else {
                    multipleProOptIds = false

                }

            },

            onCancelContract: function () {
                var that = this;
                that.byId("createContractDialog").close();
                MessageToast.show(this.geti18n("contractNotCreated"));
            },

            onCancelAddNewProdOpt: function (event) {
                event.getSource().getParent().close();
                MessageToast.show(this.geti18n("contractNotCreated"));
            },

            onDeleteSelectedContract: function () {
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
                            .getModel("Contracts")
                            .getProperty("/oDataUrl");
                        var oModel = new sap.ui.model.odata.v2.ODataModel(serviceURL);

                        var deleteContrId = sap.ui
                            .getCore()
                            .byId("deleteContractId")
                            .getValue();
                        deleteContrId = parseInt(deleteContrId);

                        var dPath =
                            "/ContractSet(Contrid=" +
                            deleteContrId +
                            ")";

                        oModel.remove(dPath, {
                            method: "DELETE",
                            success: function (oData, oResponse) {
                                sap.m.MessageToast.show("Successfully deleted!");
                                oModel.refresh();
                                that.onClear();
                                sap.ui.getCore().byId("deletePopup").destroy();
                            },
                            error: function (oError) {
                                sap.m.MessageToast.show("Error during contract deletion");
                            },
                        });
                    },
                });

                if (that.getView().byId("contractTable").getSelectedItem() != null) {
                    var selectedItem = that
                        .getView()
                        .byId("contractTable")
                        .getSelectedItem()
                        .getBindingContext();

                    var oDialog = new sap.m.Dialog("deletePopup", {
                        title: that.geti18n("deletePopupAllocation"),
                        modal: true,
                        contentWidth: "1em",
                        buttons: [deleteButton, cancelButton],
                        content: [
                            new sap.m.Label({
                                text: that.geti18n("contractId"),
                            }),
                            new sap.m.Input({
                                id: "deleteContractId",
                                value: selectedItem.getProperty("Contrid"),
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

            onUpdateSelectedContract: function () {
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
                            .getModel("Contracts")
                            .getProperty("/oDataUrl");
                        var oModel = new sap.ui.model.odata.v2.ODataModel(serviceURL);

                        var oUpdatedContract = {
                            Contrid: parseInt(sap.ui.getCore().byId("updateContractId").getValue()),
                            Name_org1: sap.ui.getCore().byId("updatePartnerName").getValue(),
                            Partnerid: sap.ui.getCore().byId("updatePartnerId").getValue(),
                            Prodoptid: parseInt(sap.ui.getCore().byId("updateProductOptions").getValue()),
                            Contrabegin: sap.ui.getCore().byId("updateContraBegin").getValue(),
                            Contraend: sap.ui.getCore().byId("updateContraEnd").getValue(),
                            Ucccontact_main: sap.ui
                                .getCore()
                                .byId("updateUcccontact")
                                .getValue(),

                            Poname: sap.ui.getCore().byId("updatePoname").getValue(),
                            Internalcomment: sap.ui.getCore().byId("updateInternalComment").getValue(),

                        };


                        var updateContrId = parseInt(that
                            .getView()
                            .byId("contractTable")
                            .getSelectedItem().getBindingContext().getProperty("Contrid"));

                        var dPath =
                            "/ContractSet(Contrid=" +
                            updateContrId +
                            ")";

                        oModel.update(dPath, oUpdatedContract, {
                            success: function (oData, oResponse) {


                                sap.m.MessageToast.show("Successfully updated!");
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

                if (that.getView().byId("contractTable").getSelectedItem() != null) {
                    var selectedItem = that
                        .getView()
                        .byId("contractTable")
                        .getSelectedItem()
                        .getBindingContext();

                    var oDialog = new sap.m.Dialog("updatePopup", {
                        title: that.geti18n("updatePopupAllocation"),
                        modal: true,
                        contentWidth: "2em",
                        buttons: [updateButton, cancelButton],
                        content: [
                            new sap.m.Label({
                                text: that.geti18n("contractId"),
                            }),
                            new sap.m.Input({
                                id: "updateContractId",
                                value: selectedItem.getProperty("Contrid"),
                                editable: false,
                            }),
                            new sap.m.Label({
                                text: that.geti18n("partnerName"),
                            }),
                            new sap.m.Input({
                                id: "updatePartnerName",
                                value: selectedItem.getProperty("Name_org1"),
                                editable: false,
                            }),
                            new sap.m.Label({
                                text: that.geti18n("partnerId"),
                            }),
                            new sap.m.Input({
                                id: "updatePartnerId",
                                value: selectedItem.getProperty("Partnerid"),
                                editable: false,
                            }),
                            new sap.m.Label({
                                text: that.geti18n("productOptions"),
                            }),
                            new sap.m.Input({
                                id: "updateProductOptions",
                                value: selectedItem.getProperty("Prodoptid"),
                                editable: false,
                            }),
                            new sap.m.Label({
                                text: that.geti18n("startDate"),
                            }),
                            new sap.m.DatePicker({
                                id: "updateContraBegin",
                                value: selectedItem.getProperty("Contrabegin"),
                                editable: false,
                            }),
                            new sap.m.Label({
                                text: that.geti18n("endDate"),
                            }),
                            new sap.m.DatePicker({
                                id: "updateContraEnd",
                                value: selectedItem.getProperty("Contraend"),
                                editable: true,
                            }),
                            new sap.m.Label({
                                text: that.geti18n("uccContact"),
                            }),
                            new sap.m.Input({
                                id: "updateUcccontact",
                                value: selectedItem.getProperty("Ucccontact_main"),
                                editable: false,
                            }),
                            new sap.m.Label({
                                text: that.geti18n("price"),
                            }),
                            new sap.m.Input({
                                id: "updatePrice",
                                value: selectedItem.getProperty("Price"),
                                editable: false,
                            }),
                            new sap.m.Label({
                                text: that.geti18n("poname"),
                            }),
                            new sap.m.Input({
                                id: "updatePoname",
                                value: selectedItem.getProperty("Poname"),
                                editable: false,
                            }),
                            new sap.m.Label({
                                text: that.geti18n("comment"),
                            }),
                            new sap.m.TextArea({
                                id: "updateInternalComment",
                                value: selectedItem.getProperty("Internalcomment"),
                                editable: true,
                                growing: true,
                                maxLength: 300,
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

            _handleValueHelpClose: function (evt) {
                var oSelectedItem = evt.getParameter("selectedItem");
                if (oSelectedItem) {
                    var productInput = this.byId(this.inputId);
                    productInput.setValue(oSelectedItem.getTitle());
                }
                evt.getSource().getBinding("items").filter([]);
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
            },

            onClear: function () {
                var serviceURL = this.getView()
                    .getModel("Contracts")
                    .getProperty("/oDataUrl");
                var oModel = new sap.ui.model.odata.v2.ODataModel(serviceURL);
                this.getView().byId("contractTable").setModel(oModel);
            }

        });
    }
);
