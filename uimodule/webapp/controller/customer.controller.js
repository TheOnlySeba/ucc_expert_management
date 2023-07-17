sap.ui.define([
    "iService_UI5/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/ui/core/util/Export",
    "sap/ui/core/util/ExportTypeCSV"

], function (Controller, JSONModel, Filter, FilterOperator, MessageToast) {
    "use strict";
    var oModel;
    var backupData = new JSONModel();
    var oFragment;
    var oButtonsFragment;
    var initial;
    var postCodeLength = [];


    //	var isUcc = sap.ui.getCore().byId("__xmlview0").getModel("userModel").getData().UCC;
    //	var isSapAV = sap.ui.getCore().byId("__xmlview0").getModel("userModel").getData().AV;
    //	var hasRights = isUcc || isSapAV;
    return Controller.extend("iService_UI5.controller.customer", {


        onInit: function (oData) {
            this.getOwnerComponent().getRouter().getRoute("customer")
                .attachPatternMatched(this._onRouteMatched, this);
            var oTable = this.getView().byId("iServiceUserTable");
            oTable.addEventDelegate({
                onAfterRendering: function () {
                    $(".sapMCbRo").parent().css("padding", "0 0 0 0");
                }
            });

        },

        getPostCodeLength: function () {
            oModel.read("/PostCodeLengthSet", {
                success: function (oData) {
                    oData.results.forEach(function (oItem) {
                        /*var item = {
                            Country: oItem.Land1,
                            Length: oItem.Lnplz
                        };*/
                        postCodeLength[oItem.Land1] = oItem.Lnplz;

                    });
                }
            });
        },

        loadFragment: function () {

            if (!oFragment) {
                var oPanel = this.getView().byId("Kundendaten");
                oFragment = sap.ui.xmlfragment(this.getView().getId(), "iService_UI5.fragment.customer", this);
                oPanel.insertContent(oFragment);
            }

            if (sap.ui.getCore().byId("__xmlview0").getModel("userModel") == undefined) {
                var hasRights = false;
            } else {
                var isUcc = sap.ui.getCore().byId("__xmlview0").getModel("userModel").getData().UCC;
                var isSapAV = sap.ui.getCore().byId("__xmlview0").getModel("userModel").getData().AV;
                var hasRights = isUcc || isSapAV;
            }

            sap.ui.getCore().byId("__xmlview0--createUserButton").setVisible(hasRights);
            sap.ui.getCore().byId("__xmlview0--onNavCustomerButton").setVisible(false);

            this.getView().byId("aendernButton").setVisible(hasRights);
            this.getView().byId("sichernButton").setVisible(false);
            this.getView().byId("abbrechenButton").setVisible(false);
            this.getView().byId("loeschenButton").setVisible(false);
            this.getView().byId("wiedererstellenButton").setVisible(false);
            this.getView().byId("aktivierenButton").setVisible(false);

            this.getHostingart();
            this.toggleEditMode(false);
            this.getPostCodeLength();
        },

        collectData: function () {
            var allData = [
                this.getView().byId("Name_1Input"),
                this.getView().byId("Name_2Input"),
                this.getView().byId("HomeInput"),
                this.getView().byId("ArtBox"),
                this.getView().byId("HostingartBox"),
                this.getView().byId("hostedByInput"),
                this.getView().byId("AnschlussDate"),
                this.getView().byId("KuendigungDate"),
                this.getView().byId("StrasseInput"),
                this.getView().byId("HausnumerInput"),
                this.getView().byId("PLZInput"),
                this.getView().byId("OrtInput"),
                this.getView().byId("LandBox"),
                this.getView().byId("BundeslandBox"),
                this.getView().byId("ProgramBox")
            ];

            return allData;
        },

        toggleEditMode: function (enable) {
            var allData = this.collectData();

            if (sap.ui.getCore().byId("__xmlview0").getModel("userModel") == undefined) {
                var hasRights = false;
                var isUcc = false;
            } else {
                var isUcc = sap.ui.getCore().byId("__xmlview0").getModel("userModel").getData().UCC;
                var isSapAV = sap.ui.getCore().byId("__xmlview0").getModel("userModel").getData().AV;
                var hasRights = isUcc || isSapAV;
            }

            if (this.getView().byId("infoBox").getModel() != undefined) {
                var status = this.getView().byId("infoBox").getModel().getProperty("/STATUS");

                allData.forEach(function (oDataPiece) {
                    if (status != 'aktiv') {
                        oDataPiece.setEditable(false);
                    } else {
                        oDataPiece.setEditable(enable);
                    }
                    oDataPiece.setValueState("None");
                });

                this.getView().byId("aendernButton").setVisible(!enable && hasRights);
                this.getView().byId("sichernButton").setVisible(enable && (status == 'aktiv') && hasRights);
                this.getView().byId("abbrechenButton").setVisible(enable);
                this.getView().byId("loeschenButton").setVisible(enable && (status == 'aktiv' && isUcc));
                this.getView().byId("wiedererstellenButton").setVisible(enable && (status == 'gelöscht') && hasRights);
                this.getView().byId("aktivierenButton").setVisible(enable && (status == 'im Anschluss') && hasRights);
                this.setPlzLength(this.getView().byId("LandBox").getSelectedKey());
            }

        },

        cancelChanges: function () {
            this.bindDataToBox(backupData.getData());

            this.toggleEditMode(false);
        },

        saveData: function () {
            var allData = this.collectData();
            var customerId = this.getView().byId("infoBox").getModel().getProperty("/Partner");
            var canChange = true;
            var sapRole = this.getView().getModel("userModel").getData().Utext;
            var translator = this.getView().getModel("i18n").getResourceBundle();
            var that = this;

            //			allData.forEach(function(oDataPiece) {
            //				if(oDataPiece.mProperties.value.trim().length == 0 &&
            //				!oDataPiece.getId().includes("KuendigungDate") &&
            //				!oDataPiece.getId().includes("Name_2Input") &&
            //				!oDataPiece.getId().includes("hostedByInput") &&
            //				!oDataPiece.getId().includes("BundeslandBox")) {
            //					oDataPiece.setValueState("Error");
            //					canChange = false;
            //				}
            //			});

            allData.forEach(function (oDataPiece) {
                if (oDataPiece.mProperties.value.trim().length == 0 &&
                    (oDataPiece.getId().includes("Name_1Input") ||
                        oDataPiece.getId().includes("HomeInput") ||
                        oDataPiece.getId().includes("AnschlussDate") ||
                        oDataPiece.getId().includes("StrasseInput") ||
                        oDataPiece.getId().includes("HausnumerInput") ||
                        oDataPiece.getId().includes("PLZInput") ||
                        oDataPiece.getId().includes("OrtInput") ||
                        oDataPiece.getId().includes("LandBox") ||
                        (oDataPiece.getId().includes("ArtBox") && sapRole != "UCC Customer") ||
                        (oDataPiece.getId().includes("HostingartBox") && sapRole != "UCC Customer") ||
                        (oDataPiece.getId().includes("ProgramBox") && sapRole != "UCC Customer")
                    )
                ) {
                    oDataPiece.setValueState("Error");
                    canChange = false;
                }
            });

            if (this.getView().byId("KuendigungDate").getValue() != "") {
                if (this.getView().byId("AnschlussDate").getDateValue() >
                    this.getView().byId("KuendigungDate").getDateValue()) {
                    canChange = false;
                    this.getView().byId("AnschlussDate").setValueState("Error");
                    this.getView().byId("KuendigungDate").setValueState("Error");
                }
            }

            // ensure that all ComoBoxes have a selected key (value was taken from dropdown-list and has a valid key)
            if (this.getView().byId("ArtBox").getSelectedKey() == "" && sapRole != "UCC Customer") {
                canChange = false;
                this.getView().byId("ArtBox").setValueState("Error");
            }
            if (this.getView().byId("HostingartBox").getSelectedKey() == "" && sapRole != "UCC Customer") {
                this.getView().byId("HostingartBox").setValueState("Error");
                canChange = false;
            }
            if (this.getView().byId("ProgramBox").getSelectedKey() == "" && sapRole != "UCC Customer") {
                this.getView().byId("ProgramBox").setValueState("Error");
                canChange = false;
            }
            if (this.getView().byId("LandBox").getSelectedKey() == "") {
                this.getView().byId("LandBox").setValueState("Error");
                canChange = false;
            }

            if (canChange) {
                var oData = {
                    CITY: this.getView().byId("OrtInput").getValue(),
                    COUNTRY: this.getView().byId("LandBox").getSelectedKey(),
                    FOUNDATIONDATE: this.getView().byId("AnschlussDate").getDateValue(),
                    LIQUIDATIONDATE: this.getView().byId("KuendigungDate").getDateValue(),
                    FOUNDATIONFLAG: this.FOUNDATIONFLAG,
                    LIQUIDATIONFLAG: this.LIQUIDATIONFLAG,
                    HOUSE_NO: this.getView().byId("HausnumerInput").getValue(),
                    LEGALFORM: this.getView().byId("ArtBox").getSelectedKey(),
                    NAME1: this.getView().byId("Name_1Input").getValue(),
                    NAME2: this.getView().byId("Name_2Input").getValue(),
                    PARTNERTYPE: this.getView().byId("HostingartBox").getSelectedKey(),
                    HOSTEDBY: this.getView().byId("hostedByInput").getValue(),
                    PROGRAM: this.getView().byId("ProgramBox").getSelectedKey(),
                    POSTL_COD1: this.getView().byId("PLZInput").getValue(),
                    Partner: this.getView().byId("KundennumerInput").getValue(),
                    STREET: this.getView().byId("StrasseInput").getValue(),
                    URI: this.getView().byId("HomeInput").getValue(),
                    REGION: this.getView().byId("BundeslandBox").getSelectedKey()
                };

                oModel.update("/ClientEntitySet(Partner='" + customerId + "')", oData, {
                    success: function (oData, oResponse) {
                        that.toggleEditMode(false);
                        MessageToast.show(translator.getText("saveSuccess"));
                        that.fetchBackendData(that.getView().getModel("md"), customerId);
                    },
                    error: function (oError) {
                        MessageToast.show(translator.getText("saveError") + JSON.parse(oError.responseText).error.message.value);
                        console.log(oError);
                    }
                });
            }
            else {
                MessageToast.show(translator.getText("fieldsCannotBeEmpty"));
            }
        },

        changeData: function (oData) {
            var canChange = true;
            var translator = this.getView().getModel("i18n").getResourceBundle();
            var allData = this.collectData();
            allData.forEach(function (oDataPiece) {
                oDataPiece.setValueState("None");
            });

            var oModel = this.getView().byId("infoBox").getModel();

            backupData.setData({
                Partner: oModel.getProperty("/Partner"),
                NAME1: oModel.getProperty("/NAME1"),
                NAME2: oModel.getProperty("/NAME2"),
                URI: oModel.getProperty("/URI"),
                LEGALFORM: oModel.getProperty("/LEGALFORM"),
                PARTNERTYPE: oModel.getProperty("/PARTNERTYPE"),
                HOSTEDBY: oModel.getProperty("/HOSTEDBY"),
                FOUNDATIONDATE: oModel.getProperty("/FOUNDATIONDATE"),//new Date(oModel.getProperty("/FOUNDATIONDATE")),
                LIQUIDATIONDATE: oModel.getProperty("/LIQUIDATIONDATE"),//(oModel.getProperty("/LIQUIDATIONDATE") ? new Date(oModel.getProperty("/LIQUIDATIONDATE")): null),
                STREET: oModel.getProperty("/STREET"),
                HOUSE_NO: oModel.getProperty("/HOUSE_NO"),
                POSTL_COD1: oModel.getProperty("/POSTL_COD1"),
                CITY: oModel.getProperty("/CITY"),
                COUNTRY: oModel.getProperty("/COUNTRY"),
                REGION: oModel.getProperty("/REGION"),
                STATUS: oModel.getProperty("/STATUS"),
                PROGRAM: oModel.getProperty("/PROGRAM")
            });

            this.toggleEditMode(true);
            MessageToast.show(translator.getText("enterEditMode"));
        },

        deleteData: function () {
            var endDate = this.getView().byId("infoBox").getModel().getProperty("/LIQUIDATIONDATE");
            var translator = this.getView().getModel("i18n").getResourceBundle();
            var customerId = this.getView().byId("infoBox").getModel().getProperty("/Partner");
            var that = this;
            if (!endDate || endDate < this.getView().byId("infoBox").getModel().getProperty("/FOUNDATIONDATE")) {
                this.getView().byId("KuendigungDate").setValueState("Error");
            } else {
                var urlParameter = endDate.getFullYear().toString() +
                    ((endDate.getMonth() + 1).toString().length < 2 ? "0" + (endDate.getMonth() + 1).toString() : (endDate.getMonth() + 1).toString()) +
                    (endDate.getDate().toString().length < 2 ? "0" + endDate.getDate().toString() : endDate.getDate().toString());
                oModel.remove("/ClientEntitySet('" + customerId + "****" + urlParameter + "')", {
                    success: function (oData, oResponse) {
                        that.toggleEditMode(false);
                        MessageToast.show(translator.getText("deleteSuccess"));
                        that.fetchBackendData(that.getView().getModel("md"), customerId);
                    },
                    error: function (oError) {
                        MessageToast.show(translator.getText("deleteError") + JSON.parse(oError.responseText).error.message.value);
                        console.log(oError);
                    }
                });
            }

        },

        activateData: function () {
            var customerId = this.getView().byId("infoBox").getModel().getProperty("/Partner");
            var that = this;
            var translator = this.getView().getModel("i18n").getResourceBundle();
            oModel.callFunction("/ActivateCustomerData", {
                "method": "POST",
                urlParameters: {
                    activate: customerId
                },
                success: function (oData, oResponse) {
                    that.toggleEditMode(false);
                    MessageToast.show(translator.getText("activateSuccess"));
                    that.fetchBackendData(that.getView().getModel("md"), customerId);
                },
                error: function (oError) {
                    MessageToast.show(translator.getText("activateError") + JSON.parse(oError.responseText).error.message.value);
                    console.log(oError);
                }
            });
        },

        reviveData: function () {
            var customerId = this.getView().byId("infoBox").getModel().getProperty("/Partner");
            var that = this;
            var translator = this.getView().getModel("i18n").getResourceBundle();
            oModel.callFunction("/ReviveCustomerData", {
                "method": "POST",
                urlParameters: {
                    revive: customerId
                },
                success: function (oData, oResponse) {
                    that.toggleEditMode(false);
                    MessageToast.show(translator.getText("resetSuccess"));
                    that.fetchBackendData(that.getView().getModel("md"), customerId);
                },
                error: function (oError) {
                    MessageToast.show(translator.getText("resetError") + JSON.parse(oError.responseText).error.message.value);
                    console.log(oError);
                }
            });
        },

        handleValueHelp: function (oEvent) {

            var sInputValue = oEvent.getSource().getValue();

            this.inputId = oEvent.getSource().getId();

            // create value help dialog
            if (!this._valueHelpDialog) {
                this._valueHelpDialog = sap.ui.xmlfragment("iService_UI5.fragment.DialogHostedCustomers", this);
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

            //			oFilter = this.createFilter2(sValue);
            //			evt.getSource().getBinding("items").filter([oFilter]);
        },

        createFilter1: function (sInputValue) {
            var oFilter = new Filter({
                path: 'NAME1',
                operator: sap.ui.model.FilterOperator.Contains,
                value1: sInputValue,
            });

            return oFilter;
        },

        createFilter2: function (sInputValue) {
            var oFilter = new Filter({
                path: 'NAME1',
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

        bindDataToBox: function (oData) {
            var oBox = this.getView().byId("infoBox");
            var oModel = new JSONModel();

            var data = {
                CITY: oData.CITY,
                COUNTRY: oData.COUNTRY,
                FOUNDATIONDATE: oData.FOUNDATIONDATE,//null,
                HOUSE_NO: oData.HOUSE_NO,
                LEGALFORM: oData.LEGALFORM,
                LIQUIDATIONDATE: oData.LIQUIDATIONDATE,//null,
                NAME1: oData.NAME1,
                NAME2: oData.NAME2,
                PARTNERTYPE: oData.PARTNERTYPE,
                HOSTEDBY: oData.HOSTEDBY,
                POSTL_COD1: oData.POSTL_COD1,
                Partner: oData.Partner,
                STREET: oData.STREET,
                URI: oData.URI,
                STATUS: oData.STATUS,
                PROGRAM: oData.PROGRAM
            };
            oModel.setData(data);

            oBox.setModel(oModel);
            //this.getView().byId("AnschlussDate").setDateValue(oData.FOUNDATIONDATE);
            //this.getView().byId("KuendigungDate").setDateValue(oData.LIQUIDATIONDATE);
            this.getView().byId("LandBox").fireChange();

            oModel.setProperty("/REGION", oData.REGION);
            this.getView().byId("BundeslandBox").fireChange();
        },


        bindDataToTable: function (oData) {
            var oTable = this.getView().byId("iServiceUserTable");
            var searchQuery = [];
            var oModel = new JSONModel();
            oData.results.forEach(function (oDataPiece) {
                searchQuery.push({
                    "PARTNER": oDataPiece.PARTNER,
                    "TITLE_MEDI": oDataPiece.TITLE_MEDI,
                    "TITLE_TEXT": oDataPiece.TITLE_TEXT,
                    "NAME_FIRST": oDataPiece.NAME_FIRST,
                    "NAME_LAST": oDataPiece.NAME_LAST,
                    "EMAIL": oDataPiece.EMAIL,
                    "STATUS": oDataPiece.STATUS,
                    "BEMERKUNG": oDataPiece.BEMERKUNG,
                    "SAPL": oDataPiece.SAPL,
                    "SAPR": oDataPiece.SAPR,
                    "SAPA": oDataPiece.SAPA,
                    "SAPV": oDataPiece.SAPV,
                    "SAPD": oDataPiece.SAPD,
                    "SAPT": oDataPiece.SAPT,
                    "SAPP": oDataPiece.SAPP
                });
            });

            oModel.setData({
                searchQuery: searchQuery
            });
            oTable.setModel(oModel);
            oTable.bindRows("/searchQuery");
            oTable.setVisibleRowCount(oData.results.length);
            this.selectFilter();
        },

        bindDataToTable2: function (oData) {
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
            oTable.setVisibleRowCount(oData.results.length);
            this.selectFilter();
        },

        handleNavigationPress: function (oEvent) {
            var oRow = oEvent.getParameter("row");
            var institution = window.location.href.split("/");

            this.getRouter().navTo("user", {
                userId: oRow.getCells()[0].getProperty("text"),
                customerId: institution[institution.length - 1]
            });
        },

        _onRouteMatched: function (oEvent) {

            //this.toggleEditMode(false);
            var oSettingsModel = this.getSettingsModel();
            var customerId = oEvent.getParameter("arguments").customerId;
            var that = this;
            oSettingsModel.attachRequestCompleted(function () {
                var serviceURL = this.getProperty("/oDataUrl");
                oModel = new sap.ui.model.odata.v2.ODataModel(serviceURL);
                oModel.setSizeLimit(100000000);
                var oView = that.getView();
                oView.setModel(oModel, "md");
                oView.setModel(new JSONModel({
                    globalFilter: ""
                }), "ui");

                that._oGlobalFilter = null;
                that._oStatusFilter = null;
                that.fetchBackendData(oModel, customerId);
                that.fetchBackendData2(oModel, customerId);
                that.loadFragment();

                var fnPress = that.handleNavigationPress.bind(that);
                oView.byId("iServiceUserTable").setRowActionTemplate(
                    new sap.ui.table.RowAction({
                        items: [new sap.ui.table.RowActionItem({
                            type: "Navigation",
                            press: fnPress,
                            visible: true
                        })]
                    })
                );
                oView.byId("iServiceUserTable").setRowActionCount(1);
                if (!initial) {
                    that.clearAllFilters();
                }
                initial = false;
            });

        },

        fetchBackendData: function (oModel, customerId) {
            var that = this;
            oModel.read("/ClientEntitySet('" + customerId + "')", {
                success: function (oData) {
                    that.bindDataToBox(oData);

                }
            });
            oModel.read("/ClientTableSet", {
                filters: [new Filter("PARTNER", FilterOperator.StartsWith, customerId),
                ],

                success: function (oData) {
                    that.bindDataToTable(oData);

                }
            });
        },

        fetchBackendData2: function (oModel, customerId) {
            var that = this;

            var oTable = this.getView().byId("contractTable");
            oModel.read("/ContractSet", {
                filters: [new Filter("Partnerid", FilterOperator.EQ, customerId)],

                success: function (oData) {
                    that.bindDataToTable2(oData);
                }
            });
        },

        onAfterRendering: function () {
            $(".sapMFlexBox, .sapMHBox").css("padding-left", "inherit");
            $(".sapMFlexBox, .sapMHBox").css("padding-bottom", "inherit");
            $("[id*=buttonsHBox]").css("padding-top", "inherit");
            $("[id*=buttonsHBox]").css("padding-bottom", "");
        },

        setPlzLength: function (sQuery) {
            var plz = this.getView().byId("PLZInput");

            if (plz.getEditable()) {
                var length = postCodeLength[sQuery];
                if (!length) {
                    this.getPostCodeLength();
                }

                var intLength = parseInt(length);
                if (!intLength) {
                    intLength = 10;
                }
                plz.setMaxLength(parseInt(intLength));
                plz.setValue(plz.getValue().substring(0, intLength));
                plz.updateInputField();
            }

        },

        countryChange: function (oEvent) {
            var sQuery = oEvent.getSource().getProperty("selectedKey");
            var that = this;
            if (sQuery) {

                this.setPlzLength(sQuery);

                that.getView().byId("BundeslandBox").setSelectedKey("");
                that.getView().byId("BundeslandBox").destroyItems();

                oModel.read("/BundeslandSet", {
                    filters: [new Filter("Land1", FilterOperator.EQ, sQuery)],

                    success: function (oData) {
                        var oLabel = that.getView().byId("BundeslandBox");
                        oLabel.destroyItems();
                        oData.results.forEach(function (oItem) {
                            var item = new sap.ui.core.Item();
                            item.setKey(oItem.Bland);
                            item.setText(oItem.Bezei);
                            oLabel.addItem(item);
                        });
                    }
                });
            }
        },

        getHostingart: function () {
            var that = this;

            oModel.read("/HostingartSet", {
                success: function (oData) {
                    var oLabel = that.getView().byId("HostingartBox");
                    oLabel.destroyItems();
                    oData.results.forEach(function (oItem) {
                        var item = new sap.ui.core.Item();
                        item.setKey(oItem.Bpkind);
                        item.setText(oItem.Text40);
                        oLabel.addItem(item);
                    });
                }
            });
        },

        _filter: function (oEvent) {
            var oFilter = null;
            var that = this;
            var oTable = this.getView().byId("iServiceUserTable");

            if (this._oGlobalFilter && !this._oStatusFilter) {
                oFilter = this._oGlobalFilter;

            } else if (!this._oGlobalFilter && this._oStatusFilter) {
                oFilter = this._oStatusFilter;
            } else if (this._oGlobalFilter && this._oStatusFilter) {
                oFilter = new Filter([this._oStatusFilter, this._oGlobalFilter], true);

            }

            if (oTable.getBinding("rows").filter(oFilter, "Application").getLength() === 1) {


                var oRowContext = oTable.getContextByIndex(0);
                var oRowObject = oRowContext.getObject();

                var institution = window.location.href.split("/");

                this.getRouter().navTo("user", {
                    userId: oRowObject.PARTNER,
                    customerId: institution[institution.length - 1]
                });
            } else {
                oTable.getBinding("rows").filter(oFilter, "Application");
            }


        },

        clearAllFilters: function (oEvent) {
            var oTable = this.byId("iServiceUserTable");

            var oUiModel = this.getView().getModel("ui");
            oUiModel.setProperty("/globalFilter", "");

            this._oGlobalFilter = null;
            this._filter();

            var aColumns = oTable.getColumns();
            for (var i = 0; i < aColumns.length; i++) {
                oTable.filter(aColumns[i], null);
            }
        },

        selectFilter: function (oEvent) {
            this.triggerFilter(this.getView().byId("globalSearchC").getValue(),
                this.getView().byId("aktivC").getSelected(),
                this.getView().byId("anschlussC").getSelected(),
                this.getView().byId("geloeschtC").getSelected());
        },

        triggerFilter: function (query, aktiv, im_anschluss, geloescht, oEvent) {

            this._oGlobalFilter = null;
            this._oStatusFilter = null;

            var oAktivFilter = new Filter("STATUS", FilterOperator.EQ, "aktiv");
            var oAnschlussFilter = new Filter("STATUS", FilterOperator.EQ, "im Anschluss");
            var oGeloeschtFilter = new Filter("STATUS", FilterOperator.EQ, "gelöscht");



            if (query) {
                this._oGlobalFilter = new Filter([
                    new Filter("PARTNER", FilterOperator.Contains, query),
                    new Filter("TITLE_MEDI", FilterOperator.Contains, query),
                    new Filter("TITLE_TEXT", FilterOperator.Contains, query),
                    new Filter("NAME_FIRST", FilterOperator.Contains, query),
                    new Filter("NAME_LAST", FilterOperator.Contains, query),
                    new Filter("EMAIL", FilterOperator.Contains, query),
                    new Filter("BEMERKUNG", FilterOperator.Contains, query)
                ], false);
            }

            if (aktiv) {

                if (this._oStatusFilter) {
                    this._oStatusFilter = new Filter([this._oStatusFilter, oAktivFilter], false);
                } else {
                    this._oStatusFilter = oAktivFilter;
                }

            }

            if (im_anschluss) {

                if (this._oStatusFilter) {
                    this._oStatusFilter = new Filter([this._oStatusFilter, oAnschlussFilter], false);
                } else {
                    this._oStatusFilter = oAnschlussFilter;
                }
            }

            if (geloescht) {

                if (this._oStatusFilter) {
                    this._oStatusFilter = new Filter([this._oStatusFilter, oGeloeschtFilter], false);
                } else {
                    this._oStatusFilter = oGeloeschtFilter;
                }
            }

            this._filter(oEvent);


        },

        filterGlobally: function (oEvent) {
            this.triggerFilter(oEvent.getParameter("query"),
                this.getView().byId("aktivC").getSelected(),
                this.getView().byId("anschlussC").getSelected(),
                this.getView().byId("geloeschtC").getSelected(), oEvent);
        },

        exportcsv: sap.m.Table.prototype.exportData || function (oData) {
            var oModel = new JSONModel();
            var searchQuery = [];
            var that = this;

            this.getView().byId("iServiceUserTable").getBinding("rows").getContexts().forEach(function (context) {
                searchQuery.push(that.getView().byId("iServiceUserTable").getModel().getProperty(context.sPath));
            });
            oModel.setData({
                searchQuery: searchQuery
            });





            var oExport = new sap.ui.core.util.Export({
                exportType: new sap.ui.core.util.ExportTypeCSV({
                    separatorChar: ",",
                    charset: "utf-8"
                }),
                models: oModel,
                rows: {
                    path: "/searchQuery"
                },
                columns: [
                    {
                        name: this.getView().getModel("i18n").getProperty("userId"),
                        template: {
                            content: "{PARTNER}"
                        }
                    },
                    {
                        name: this.getView().getModel("i18n").getProperty("salutation"),
                        template: {
                            content: "{TITLE_MEDI}"
                        }
                    },
                    {
                        name: this.getView().getModel("i18n").getProperty("title"),
                        template: {
                            content: "{TITLE_TEXT}"
                        }
                    },
                    {
                        name: this.getView().getModel("i18n").getProperty("firstName"),
                        template: {
                            content: "{NAME_FIRST}"
                        }
                    },
                    {
                        name: this.getView().getModel("i18n").getProperty("lastName"),
                        template: {
                            content: "{NAME_LAST}"
                        }
                    },
                    {
                        name: "E-mail",
                        template: {
                            content: "{EMAIL}"
                        }
                    },
                    {
                        name: this.getView().getModel("i18n").getProperty("unit"),
                        template: {
                            content: "{BEMERKUNG}"
                        }
                    },
                    {
                        name: "L",
                        template: {
                            content: "{SAPL}"
                        }
                    },
                    {
                        name: "R",
                        template: {
                            content: "{SAPR}"
                        }
                    },
                    {
                        name: "A",
                        template: {
                            content: "{SAPA}"
                        }
                    },
                    {
                        name: "V",
                        template: {
                            content: "{SAPV}"
                        }
                    },
                    {
                        name: "D",
                        template: {
                            content: "{SAPD}"
                        }
                    },
                    {
                        name: "T",
                        template: {
                            content: "{SAPT}"
                        }
                    },
                    {
                        name: "P",
                        template: {
                            content: "{SAPP}"
                        }
                    },
                    {
                        name: "Status",
                        template: {
                            content: "{Status}"
                        }
                    },

                ]
            });
            oExport.saveFile().always(function () {
                this.destroy;
            });
            tmpData1 = null;

        },

    });

});