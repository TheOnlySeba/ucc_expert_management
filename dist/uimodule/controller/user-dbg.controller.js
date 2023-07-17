sap.ui.define([
    "iService_UI5/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast"

], function (Controller, JSONModel, Filter, FilterOperator, MessageToast) {
    "use strict";
    var oModel;
    var someModel;
    var backupData = new JSONModel();
    var oFragment;
    var oButtonsFragment;
    var postCodeLength = [];
    var isUcc;
    var isSapAV;
    var isSapT;
    var selfUser;
    var hasRights;
    var isAuthorized;
    return Controller.extend("iService_UI5.controller.user", {


        onInit: function (oData) {
            this.getOwnerComponent().getRouter().getRoute("user")
                .attachPatternMatched(this._onRouteMatched, this);
            var oTable = this.getView().byId("iServiceUserTable");

            sap.ui.getCore().byId("__xmlview0--onNavCustomerButton").setVisible(true);
            sap.ui.getCore().byId("__xmlview0--createUserButton").setVisible(false);

        },

        promise: function () {
            let loadModel = new Promise(
                (resolve) => {
                    this.initializeUModel();
                }
            );

            loadModel.then(
                function () {
                    //					this.bindDataToBox();
                }
            );
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
                var oPanel = this.getView().byId("Userdaten");
                oFragment = sap.ui.xmlfragment(this.getView().getId(), "iService_UI5.fragment.user", this);
                oPanel.insertContent(oFragment);
            }
            this.getView().byId("passwortPanel").setVisible(false);

            this.promise();

            //			sap.ui.getCore().byId("__xmlview0--createUserButton").setVisible(hasRights);
            sap.ui.getCore().byId("__xmlview0--onNavCustomerButton").setVisible(false);

            // visibility of buttons
            this.getView().byId("aendernButton").setVisible(hasRights);
            this.getView().byId("sichernButton").setVisible(false);
            this.getView().byId("abbrechenButton").setVisible(false);
            this.getView().byId("loeschenButton").setVisible(false);
            this.getView().byId("wiedererstellenButton").setVisible(false);
            this.getView().byId("aktivierenButton").setVisible(false);
            this.getView().byId("passwordResetButton").setVisible(false);

            this.toggleEditMode(false);
            this.getPostCodeLength();
        },

        checkRolles: function () {

            if (this.getView().byId("SAP-L").getSelected() ||
                this.getView().byId("SAP-R").getSelected() ||
                this.getView().byId("SAP-A").getSelected() ||
                this.getView().byId("SAP-V").getSelected() ||
                this.getView().byId("SAP-D").getSelected() ||
                this.getView().byId("SAP-T").getSelected() ||
                this.getView().byId("SAP-P").getSelected()) {
                return true;
            }
            return false;

        },

        saveData: function () {
            var allData = this.collectData();
            var userId = this.getView().byId("infoBox").getModel().getProperty("/MUser");
            var canChange = true;
            var that = this;
            var translator = this.getView().getModel("i18n").getResourceBundle();

            allData.forEach(function (oDataPiece) {
                if (!oDataPiece.getId().includes("SAP-L") &&
                    !oDataPiece.getId().includes("SAP-R") &&
                    !oDataPiece.getId().includes("SAP-A") &&
                    !oDataPiece.getId().includes("SAP-V") &&
                    !oDataPiece.getId().includes("SAP-D") &&
                    !oDataPiece.getId().includes("SAP-T") &&
                    !oDataPiece.getId().includes("SAP-P")) {
                    if (oDataPiece.mProperties.value.trim().length == 0 &&
                        !oDataPiece.getId().includes("TitelBox") &&
                        !oDataPiece.getId().includes("EinhostInput") &&
                        !oDataPiece.getId().includes("SUserInput") &&
                        !oDataPiece.getId().includes("FaxInput") &&
                        !oDataPiece.getId().includes("MobilInput")) {
                        oDataPiece.setValueState("Error");
                        canChange = false;
                    }
                }
            });

            if (!that.checkRolles()) {
                this.getView().byId("SAP-L").setValueState("Error");
                this.getView().byId("SAP-R").setValueState("Error");
                this.getView().byId("SAP-A").setValueState("Error");
                this.getView().byId("SAP-V").setValueState("Error");
                this.getView().byId("SAP-D").setValueState("Error");
                this.getView().byId("SAP-T").setValueState("Error");
                this.getView().byId("SAP-P").setValueState("Error");
                canChange = false;
                MessageToast.show(translator.getText("leastOneRolle"));
            }

            // ensure that all ComoBoxes have a selected key (value was taken from dropdown-list and has a valid key)
            if (this.getView().byId("AnredeBox").getSelectedKey() == "") {
                canChange = false;
                this.getView().byId("AnredeBox").setValueState("Error");
            }
            if (this.getView().byId("TitelBox").getValue() != "" && this.getView().byId("TitelBox").getSelectedKey() == "") {
                this.getView().byId("TitelBox").setValueState("Error");
                canChange = false;
            }
            if (this.getView().byId("FachrichtungBox").getSelectedKey() == "") {
                this.getView().byId("FachrichtungBox").setValueState("Error");
                canChange = false;
            }
            if (this.getView().byId("SpezialisierungBox").getSelectedKey() == "") {
                this.getView().byId("SpezialisierungBox").setValueState("Error");
                canChange = false;
            }
            if (this.getView().byId("LandBox").getSelectedKey() == "") {
                this.getView().byId("LandBox").setValueState("Error");
                canChange = false;
            }

            if (canChange) {
                var instution = window.location.href.split("/");
                var oData = {
                    MUser: this.getView().byId("HUserInput").getValue(),
                    Anrede: this.getView().byId("AnredeBox").getSelectedKey(),
                    Titel: this.getView().byId("TitelBox").getSelectedKey(),
                    Vorname: this.getView().byId("VornameInput").getValue(),
                    Nachname: this.getView().byId("NachnameInput").getValue(),
                    Email: this.getView().byId("EmailInput").getValue(),
                    Einhost: this.getView().byId("EinhostInput").getValue(),
                    Fachrichtung: this.getView().byId("FachrichtungBox").getSelectedKey(),
                    Spezialisierung: this.getView().byId("SpezialisierungBox").getSelectedKey(),
                    SUser: this.getView().byId("SUserInput").getValue(),
                    Strasse: this.getView().byId("StrasseInput").getValue(),
                    Hausnummer: this.getView().byId("HausnumerInput").getValue(),
                    PLZ: this.getView().byId("PLZInput").getValue(),
                    Ort: this.getView().byId("OrtInput").getValue(),
                    Land: this.getView().byId("LandBox").getSelectedKey(),
                    Telefon: this.getView().byId("TelefonInput").getValue(),
                    Fax: this.getView().byId("FaxInput").getValue(),
                    Mobil: this.getView().byId("MobilInput").getValue(),
                    L: this.getView().byId("SAP-L").getSelected(),
                    R: this.getView().byId("SAP-R").getSelected(),
                    A: this.getView().byId("SAP-A").getSelected(),
                    V: this.getView().byId("SAP-V").getSelected(),
                    D: this.getView().byId("SAP-D").getSelected(),
                    T: this.getView().byId("SAP-T").getSelected(),
                    P: this.getView().byId("SAP-P").getSelected(),
                    Instution: instution[instution.length - 3]
                };

                if (!oData.Titel || oData.Titel === "") {
                    oData.Titel = "0008"
                }

                oModel.update("/UserSet(MUser='" + userId + "')", oData, {
                    success: function (oData, oResponse) {
                        that.toggleEditMode(false);
                        MessageToast.show(translator.getText("saveSuccess"));
                        that.fetchBackendData(that.getView().getModel("md"), userId);
                    },
                    error: function (oError) {
                        MessageToast.show(translator.getText("saveError"));
                        console.log(oError);
                    }
                });
            }
            else {
                MessageToast.show(translator.getText("fieldsCannotBeEmpty"));
            }
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
            //var plz = this.getView().byId("PLZInput");
            var that = this;

            /*if(sQuery == 'PT' || sQuery == 'GB' || sQuery == 'IL') {
                plz.setMaxLength(7);
                plz.setValue(plz.getValue().substring(0, 7));
                plz.updateInputField()
            } else {
                plz.setMaxLength(5);
                plz.setValue(plz.getValue().substring(0, 5));
                plz.updateInputField()
            }*/
            if (sQuery) {
                this.setPlzLength(sQuery);
            }
        },

        deleteData: function () {
            var userId = this.getView().byId("infoBox").getModel().getProperty("/MUser");
            var that = this;
            var translator = this.getView().getModel("i18n").getResourceBundle();

            oModel.remove("/UserSet(MUser='" + userId + "')", {
                success: function (oData, oResponse) {
                    that.toggleEditMode(false);
                    MessageToast.show(translator.getText("deleteSuccess"));
                    that.fetchBackendData(that.getView().getModel("md"), userId);
                },
                error: function (oError) {
                    MessageToast.show(translator.getText("deleteError"));
                    console.log(oError);
                }
            });
        },

        reviveData: function () {
            var userId = this.getView().byId("infoBox").getModel().getProperty("/MUser");
            var that = this;
            var translator = this.getView().getModel("i18n").getResourceBundle();

            oModel.callFunction("/ReviveUserData", {
                "method": "POST",
                urlParameters: {
                    revive: userId
                },
                success: function (oData, oResponse) {
                    that.toggleEditMode(false);
                    MessageToast.show(translator.getText("resetSuccess"));
                    that.fetchBackendData(that.getView().getModel("md"), userId);
                },
                error: function (oError) {
                    MessageToast.show(translator.getText("resetError"));
                    console.log(oError);
                }
            });
        },

        activateData: function () {
            var userId = this.getView().byId("infoBox").getModel().getProperty("/MUser");
            var that = this;
            var translator = this.getView().getModel("i18n").getResourceBundle();

            oModel.callFunction("/ActivateUserData", {
                "method": "POST",
                urlParameters: {
                    activate: userId
                },
                success: function () {
                    that.toggleEditMode(false);
                    MessageToast.show(translator.getText("activateSuccess"));
                    that.fetchBackendData(that.getView().getModel("md"), userId);
                },
                error: function () {
                    MessageToast.show(translator.getText("activateError"));
                    console.log(oError);
                }
            });
        },

        resetPasswort: function () {
            var userId = this.getView().byId("infoBox").getModel().getProperty("/MUser");

            if (!this._passwortDialog) {
                this._passwortDialog = sap.ui.xmlfragment("iService_UI5.fragment.DialogResetPasswort", this);
                this._passwortDialog.setModel(this.getView().getModel("md"), "md");
                this.getView().addDependent(this._passwortDialog);
            }

            this._passwortDialog.open();
            this._passwortDialog.getAggregation("content")[0].setVisible(false);
            this._passwortDialog.getAggregation("content")[1].setEditable(false);
            this._passwortDialog.getAggregation("content")[1].setVisible(false);
            this._passwortDialog.getAggregation("content")[3].setValueState("None");
            this._passwortDialog.getAggregation("content")[5].setValueState("None");
        },

        onResetButton: function () {
            var that = this;
            var password1 = this._passwortDialog.getAggregation("content")[3].getValue();
            var password2 = this._passwortDialog.getAggregation("content")[5].getValue();
            var translator = this.getView().getModel("i18n").getResourceBundle();

            if (this.isCorrectPasswords(that, password1, password2)) {
                var userId = this.getView().byId("infoBox").getModel().getProperty("/MUser");
                var that = this;

                oModel.callFunction("/ResetPasswort", {
                    "method": "POST",
                    urlParameters: {
                        user: userId,
                        oldPass: "placeholder",	// oldPass will not be used for password-reseting (only for changing password from initial one in 'Base.controller')
                        pass1: password1,
                        pass2: password2
                    },
                    success: function (oData, oResponse) {
                        that.toggleEditMode(false);
                        MessageToast.show(translator.getText("passChangeSuccess"));
                        that.fetchBackendData(that.getView().getModel("md"), userId);
                        that.onCancelButton();
                    },
                    error: function (oError) {
                        MessageToast.show(translator.getText("passChangeError") + JSON.parse(oError.responseText).error.message.value);
                        console.log(oError);
                        that.onCancelButton();
                    }
                });
            }
        },

        onCancelButton: function () {
            this._passwortDialog.getAggregation("content")[1].setValue("");
            this._passwortDialog.getAggregation("content")[3].setValue("");
            this._passwortDialog.close();
        },

        isCorrectPasswords: function (that, password1, password2) {
            var translator = this.getView().getModel("i18n").getResourceBundle();
            if (password1.trim() != password2.trim() ||
                password1.trim().length < 6 ||
                password1.trim().length > 8) {
                that._passwortDialog.getAggregation("content")[3].setValueState("Error");
                that._passwortDialog.getAggregation("content")[5].setValueState("Error");
                MessageToast.show(translator.getText("enterValidPass"));
                return false;
            }
            return true;
        },

        changeData: function (oData) {
            var that = this;
            var canChange = true;

            var translator = this.getView().getModel("i18n").getResourceBundle();
            var allData = this.collectData();
            allData.forEach(function (oDataPiece) {
                oDataPiece.setValueState("None");
            });
            var serviceURL = $.sap.getModulePath(
                "iService_UI5",
                "/model/applicationProperties.json"
            );
            var someModel = new sap.ui.model.odata.v2.ODataModel(serviceURL);


            var oModel = this.getView().byId("infoBox").getModel();
            someModel.read("/TitleSet", {
                success: function (oData, oResponse) {
                    var oTitle = oData.results;


                    var defaultItem = new sap.ui.core.Item({

                        key: oTitle[7].TITLE_KEY,
                        text: oTitle[7].TITLE_TEXT

                    });

                    var jsonData = {
                        items: oTitle
                    };
                    var oComboBox = that.byId("TitelBox");
                    var oModel = new sap.ui.model.json.JSONModel();
                    oModel.setData(jsonData);
                    oComboBox.setModel(oModel);
                    oComboBox.setSelectedItem(defaultItem);
                    oComboBox.bindAggregation("items",
                        "/items", new sap.ui.core.ListItem({
                            key: "{TITLE_KEY}",
                            text: "{TITLE_TEXT}",

                        }));

                },
                error: function (oError) {

                }
            });

            backupData.setData({
                MUser: oModel.getProperty("/MUser"),
                Anrede: oModel.getProperty("/Anrede"),
                Titel: that.byId("TitelBox").getSelectedItem().getText(),
                Vorname: oModel.getProperty("/Vorname"),
                Nachname: oModel.getProperty("/Nachname"),
                Email: oModel.getProperty("/Email"),
                Einhost: oModel.getProperty("/Einhost"),
                Fachrichtung: oModel.getProperty("/Fachrichtung"),
                Spezialisierung: oModel.getProperty("/Spezialisierung"),
                SUser: oModel.getProperty("/SUser"),
                Strasse: oModel.getProperty("/Strasse"),
                Hausnummer: oModel.getProperty("/Hausnummer"),
                PLZ: oModel.getProperty("/PLZ"),
                Ort: oModel.getProperty("/Ort"),
                Land: oModel.getProperty("/Land"),
                Telefon: oModel.getProperty("/Telefon"),
                Fax: oModel.getProperty("/Fax"),
                Mobil: oModel.getProperty("/Mobil"),
                L: oModel.getProperty("/L"),
                R: oModel.getProperty("/R"),
                A: oModel.getProperty("/A"),
                V: oModel.getProperty("/V"),
                D: oModel.getProperty("/D"),
                T: oModel.getProperty("/T"),
                P: oModel.getProperty("/P"),
                Status: oModel.getProperty("/Status"),
            });

            this.toggleEditMode(true);
            MessageToast.show(translator.getText("enterEditMode"));
        },

        cancelChanges: function () {
            this.bindDataToBox(backupData.getData());

            this.toggleEditMode(false);
        },

        collectData: function () {
            var allData = [
                this.getView().byId("AnredeBox"),
                this.getView().byId("TitelBox"),
                this.getView().byId("VornameInput"),
                this.getView().byId("NachnameInput"),
                this.getView().byId("EinhostInput"),
                this.getView().byId("FachrichtungBox"),
                this.getView().byId("SpezialisierungBox"),
                this.getView().byId("SUserInput"),
                this.getView().byId("StrasseInput"),
                this.getView().byId("HausnumerInput"),
                this.getView().byId("PLZInput"),
                this.getView().byId("OrtInput"),
                this.getView().byId("LandBox"),
                this.getView().byId("TelefonInput"),
                this.getView().byId("FaxInput"),
                this.getView().byId("MobilInput"),
                this.getView().byId("EmailInput"),
                this.getView().byId("SAP-L"),
                this.getView().byId("SAP-R"),
                this.getView().byId("SAP-A"),
                this.getView().byId("SAP-V"),
                this.getView().byId("SAP-D"),
                this.getView().byId("SAP-T"),
                this.getView().byId("SAP-P")
            ];

            return allData;
        },

        toggleEditMode: function (enable) {
            var allData = this.collectData();

            if (this.getView().byId("infoBox").getModel() != undefined) {
                var status = this.getView().byId("infoBox").getModel().getProperty("/Status");

                allData.forEach(function (oDataPiece) {
                    if (status != 'aktiv') {
                        oDataPiece.setEditable(false);
                    } else {
                        oDataPiece.setEditable(enable);
                    }
                    oDataPiece.setValueState("None");
                });

                this.promise();

                // visibility of roles (check-boxes)
                this.getView().byId("SAP-L").setEditable(enable && isUcc);
                this.getView().byId("SAP-R").setEditable(enable && isUcc);
                this.getView().byId("SAP-A").setEditable(enable && hasRights);
                this.getView().byId("SAP-V").setEditable(enable && hasRights);
                this.getView().byId("SAP-D").setEditable(enable && hasRights);
                this.getView().byId("SAP-T").setEditable(enable && isUcc);
                this.getView().byId("SAP-P").setEditable(enable && isUcc);

                // visibility of buttons
                this.getView().byId("aendernButton").setVisible(!enable && hasRights);
                this.getView().byId("sichernButton").setVisible(enable && (status == 'aktiv') && hasRights);
                this.getView().byId("abbrechenButton").setVisible(enable);
                this.getView().byId("loeschenButton").setVisible(enable && (status == 'aktiv') && hasRights);
                this.getView().byId("wiedererstellenButton").setVisible(enable && (status == 'gelöscht') && hasRights);
                this.getView().byId("aktivierenButton").setVisible(enable && (status == 'im Anschluss') && hasRights);
                this.getView().byId("passwordResetButton").setVisible(enable && (status == 'aktiv') && (hasRights || isSapT));

                this.setPlzLength(this.getView().byId("LandBox").getSelectedKey());
            }

        },

        bindDataToBox: function (oData) {
            var oBox = this.getView().byId("infoBox");
            var oModel = new JSONModel();

            var data = {
                MUser: oData.MUser,
                Anrede: oData.Anrede,
                Titel: oData.Titel,
                Vorname: oData.Vorname,
                Nachname: oData.Nachname,
                Email: oData.Email,
                Einhost: oData.Einhost,
                Fachrichtung: oData.Fachrichtung,
                Spezialisierung: oData.Spezialisierung,
                SUser: oData.SUser,
                Strasse: oData.Strasse,
                Hausnummer: oData.Hausnummer,
                PLZ: oData.PLZ,
                Ort: oData.Ort,
                Land: oData.Land,
                Telefon: oData.Telefon,
                Fax: oData.Fax,
                Mobil: oData.Mobil,
                L: oData.L,
                R: oData.R,
                A: oData.A,
                V: oData.V,
                D: oData.D,
                T: oData.T,
                P: oData.P,
                Status: oData.Status
            };

            oModel.setData(data);
            oBox.setModel(oModel);

            if (sap.ui.getCore().byId("__xmlview0").getModel("userModel") == undefined) {
                isUcc = false;
                hasRights = false;
                isAuthorized = false;
            } else {
                isUcc = sap.ui.getCore().byId("__xmlview0").getModel("userModel").getData().UCC;
                isSapAV = sap.ui.getCore().byId("__xmlview0").getModel("userModel").getData().AV;
                isSapT = sap.ui.getCore().byId("__xmlview0").getModel("userModel").getData().T;
                selfUser = sap.ui.getCore().byId("__xmlview0").getModel("userModel").getData().UId === this.getView().byId("HUserInput").getValue()
                hasRights = isUcc || isSapAV || selfUser;
                isAuthorized = sap.ui.getCore().byId("__xmlview0").getModel("userModel").getData().isAuthorized;
            }

            //			this.getView().byId("AnredeBox").fireChange();
            //			this.getView().byId("TitelBox").fireChange();
            //			this.getView().byId("FachrichtungBox").fireChange();
            //			this.getView().byId("SpezialisierungBox").fireChange();
            //			this.getView().byId("LandBox").fireChange();
        },

        fetchBackendData: function (oModel, userId) {
            var that = this;
            oModel.read("/UserSet('" + userId + "')", {
                success: function (oData) {
                    that.bindDataToBox(oData);
                }
            });
        },

        _onRouteMatched: function (oEvent) {

            var oSettingsModel = this.getSettingsModel();
            var userId = oEvent.getParameter("arguments").userId;
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

                // promise
                let loadModel = new Promise(
                    (resolve) => {
                        that.fetchBackendData(oModel, userId);
                    }
                );
                loadModel.then(
                    function () {
                        that.bindDataToBox();
                    }
                );

                that.fetchBackendData(oModel, userId);
                that.loadFragment();

                sap.ui.getCore().byId("__xmlview0--onNavCustomerButton").setVisible(true);
                sap.ui.getCore().byId("__xmlview0--createUserButton").setVisible(false);
            });

        },


        onAfterRendering: function () {
            $(".sapMFlexBox, .sapMHBox").css("padding-left", "inherit");
            $(".sapMFlexBox, .sapMHBox").css("padding-bottom", "inherit");
            $("[id*=buttonsHBox]").css("padding-top", "inherit");
            $("[id*=buttonsHBox]").css("padding-bottom", "");
        },


    });

});