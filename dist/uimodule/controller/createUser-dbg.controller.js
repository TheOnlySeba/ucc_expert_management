sap.ui.define([
    "iService_UI5/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast"

], function (Controller, JSONModel, Filter, FilterOperator, MessageToast) {
"use strict";
var oModel;
var backupData = new JSONModel();
var oFragment;
var oButtonsFragment;
var postCodeLength = [];
return Controller.extend("iService_UI5.controller.createUser", {

    
    onInit : function(oData) {
        this.getOwnerComponent().getRouter().getRoute("createUser")
                .attachPatternMatched(this._onRouteMatched, this);
        
//			sap.ui.getCore().byId("__xmlview0--createCustomerButton").setVisible(false);
        sap.ui.getCore().byId("__xmlview0--createUserButton").setVisible(false);
        sap.ui.getCore().byId("__xmlview0--onNavCustomerButton").setVisible(false);
    },
    
    getPostCodeLength : function(){
        oModel.read("/PostCodeLengthSet", {
            success : function(oData) {
                oData.results.forEach(function(oItem){
                    /*var item = {
                        Country: oItem.Land1,
                        Length: oItem.Lnplz
                    };*/
                    postCodeLength[oItem.Land1] = oItem.Lnplz;
                    
                });
            }
        });
    },
    
    loadFragment : function() {
        
        if(!oFragment) {
            var oPanel = this.getView().byId("Userdaten");
            oFragment = sap.ui.xmlfragment(this.getView().getId(), "iService_UI5.fragment.user", this);
            oPanel.insertContent(oFragment);		
        }
        this.toggleEditMode(true);
        this.getPostCodeLength();
    },
    
    onCreate : function() {
        
        var allData = this.collectData();
        var canChange = true;
        var that = this;
        var translator = this.getView().getModel("i18n").getResourceBundle();
        
        allData.forEach(function(oDataPiece) {
            if(!oDataPiece.getId().includes("SAP-L") &&
            !oDataPiece.getId().includes("SAP-R") &&
            !oDataPiece.getId().includes("SAP-A") &&
            !oDataPiece.getId().includes("SAP-V") &&
            !oDataPiece.getId().includes("SAP-D") &&
            !oDataPiece.getId().includes("SAP-T") &&
            !oDataPiece.getId().includes("SAP-P") ) {
                if(oDataPiece.mProperties.value.trim().length == 0 &&
                !oDataPiece.getId().includes("TitelBox") &&
                !oDataPiece.getId().includes("EinhostInput") &&
                !oDataPiece.getId().includes("SUserInput") &&
                !oDataPiece.getId().includes("FaxInput") &&
                !oDataPiece.getId().includes("MobilInput") ) {
                    oDataPiece.setValueState("Error");
                    canChange = false;
                }
            }
        });
        
        if(!that.checkRolles()) {
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
        
        if(this.getView().byId("PasswortInput").getValue().trim() !=
            this.getView().byId("PasswortWiederholenInput").getValue().trim() ||
            this.getView().byId("PasswortInput").getValue().trim().length < 6 ||
            this.getView().byId("PasswortInput").getValue().trim().length > 8) {
                this.getView().byId("PasswortInput").setValueState("Error");
                this.getView().byId("PasswortWiederholenInput").setValueState("Error");
                canChange = false;
                MessageToast.show(translator.getText("enterValidPass"));
        }
        
        // ensure that all ComoBoxes have a selected key (value was taken from dropdown-list and has a valid key)
        if(this.getView().byId("AnredeBox").getSelectedKey() == "") {
            canChange = false;
            this.getView().byId("AnredeBox").setValueState("Error");
        }
        if(this.getView().byId("TitelBox").getValue() != "" && this.getView().byId("TitelBox").getSelectedKey() == "") {
            this.getView().byId("TitelBox").setValueState("Error");
            canChange = false;
        }
        if(this.getView().byId("FachrichtungBox").getSelectedKey() == "") {
            this.getView().byId("FachrichtungBox").setValueState("Error");
            canChange = false;
        }
        if(this.getView().byId("SpezialisierungBox").getSelectedKey() == "") {
            this.getView().byId("SpezialisierungBox").setValueState("Error");
            canChange = false;
        }
        if(this.getView().byId("LandBox").getSelectedKey() == "") {
            this.getView().byId("LandBox").setValueState("Error");
            canChange = false;
        }
        
        if(canChange) {
            var userId = "placehold";
            var instution = window.location.href.split("/");
            var oData = {
                    MUser : userId,
                    Anrede : this.getView().byId("AnredeBox").getSelectedKey(),
                    Titel : this.getView().byId("TitelBox").getSelectedKey(),
                    Vorname : this.getView().byId("VornameInput").getValue(),
                    Nachname : this.getView().byId("NachnameInput").getValue(),
                    Email : this.getView().byId("EmailInput").getValue(),
                    Einhost : this.getView().byId("EinhostInput").getValue(),
                    Fachrichtung : this.getView().byId("FachrichtungBox").getSelectedKey(),
                    Spezialisierung : this.getView().byId("SpezialisierungBox").getSelectedKey(),
                    SUser : this.getView().byId("SUserInput").getValue(),
                    Strasse : this.getView().byId("StrasseInput").getValue(),
                    Hausnummer : this.getView().byId("HausnumerInput").getValue(),
                    PLZ : this.getView().byId("PLZInput").getValue(),
                    Ort : this.getView().byId("OrtInput").getValue(),
                    Land : this.getView().byId("LandBox").getSelectedKey(),
                    Telefon : this.getView().byId("TelefonInput").getValue(),
                    Fax : this.getView().byId("FaxInput").getValue(),
                    Mobil : this.getView().byId("MobilInput").getValue(),
                    L : this.getView().byId("SAP-L").getSelected(),
                    R : this.getView().byId("SAP-R").getSelected(),
                    A : this.getView().byId("SAP-A").getSelected(),
                    V : this.getView().byId("SAP-V").getSelected(),
                    D : this.getView().byId("SAP-D").getSelected(),
                    T : this.getView().byId("SAP-T").getSelected(),
                    P : this.getView().byId("SAP-P").getSelected(),
                    Passwort : this.getView().byId("PasswortInput").getValue(),
                    WiederholenPasswort : this.getView().byId("PasswortWiederholenInput").getValue(),
                    Status : "im Anschluss",
                    Instution : instution[instution.length-2]
            };
            
            if(!oData.Titel || oData.Titel === ""){
                oData.Titel = "0008"
            }
            
            oModel.create("/UserSet", oData, {
                
                success : function(oData, oResponse) {
                    
                    that.getView().byId("AnredeBox").setValue(""),
                    that.getView().byId("TitelBox").setValue(""),
                    that.getView().byId("VornameInput").setValue(""),
                    that.getView().byId("NachnameInput").setValue(""),
                    that.getView().byId("EinhostInput").setValue(""),
                    that.getView().byId("FachrichtungBox").setValue(""),
                    that.getView().byId("SpezialisierungBox").setValue(""),
                    that.getView().byId("SUserInput").setValue(""),
                    that.getView().byId("StrasseInput").setValue(""),
                    that.getView().byId("HausnumerInput").setValue(""),
                    that.getView().byId("PLZInput").setValue(""),
                    that.getView().byId("OrtInput").setValue(""),
                    that.getView().byId("LandBox").setValue(""),
                    that.getView().byId("TelefonInput").setValue(""),
                    that.getView().byId("FaxInput").setValue(""),
                    that.getView().byId("MobilInput").setValue(""),
                    that.getView().byId("EmailInput").setValue(""),
                    that.getView().byId("SAP-L").setSelected(false),
                    that.getView().byId("SAP-R").setSelected(false),
                    that.getView().byId("SAP-A").setSelected(false),
                    that.getView().byId("SAP-V").setSelected(false),
                    that.getView().byId("SAP-D").setSelected(false),
                    that.getView().byId("SAP-T").setSelected(false),
                    that.getView().byId("SAP-P").setSelected(false),
                    that.getView().byId("PasswortInput").setValue(""),
                    that.getView().byId("PasswortWiederholenInput").setValue("")
                    
                    that.getRouter().navTo(
                            "user", {
                                userId : oData.MUser,
                                customerId : instution[instution.length-2]
                            });
                        MessageToast.show(translator.getText("userWithId") + oData.MUser + translator.getText("createSuccess"));
                    
                },
                error : function(oError) {
                    MessageToast.show(translator.getText("createError") + JSON.parse(oError.responseText).error.message.value);
                    console.log(oError);
                }
            });
        }
        else {
            MessageToast.show(translator.getText("fieldsCannotBeEmpty"));
        }
        
    },
    
    countryChange : function(oEvent) {
        var sQuery = oEvent.getSource().getProperty("selectedKey");
        var plz = this.getView().byId("PLZInput");
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
        
        var sQuery = oEvent.getSource().getProperty("selectedKey");
        if(sQuery){
            var plz = this.getView().byId("PLZInput");
            var that = this;
            var length = postCodeLength[sQuery];
            if(!length) {
                this.getPostCodeLength();
            }
            
            var intLength = parseInt(length);
            if(!intLength){
                intLength = 10;
            }
            plz.setMaxLength(parseInt(intLength));
            plz.setValue(plz.getValue().substring(0, intLength));
            plz.updateInputField();
        }
        
    },
    
    checkRolles : function() {
        
        if(this.getView().byId("SAP-L").getSelected() ||
            this.getView().byId("SAP-R").getSelected() ||
            this.getView().byId("SAP-A").getSelected() ||
            this.getView().byId("SAP-V").getSelected() ||
            this.getView().byId("SAP-D").getSelected() ||
            this.getView().byId("SAP-T").getSelected() ||
            this.getView().byId("SAP-P").getSelected()	) {
                return true;
            }
        return false;
        
    },
    
    toggleEditMode : function(enable){
        var allData = this.collectData();
        
        allData.forEach(function(oDataPiece) {
            oDataPiece.setEditable(enable);
            oDataPiece.setValueState("None");
        });

    },
    
    collectData : function() {
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
            this.getView().byId("SAP-P"),
            this.getView().byId("PasswortInput"),
            this.getView().byId("PasswortWiederholenInput")
        ];

        return allData;
    },

    _onRouteMatched : function(oEvent) {
        
        //this.toggleEditMode(false);
        var oSettingsModel = this.getSettingsModel();
        var customerId = oEvent.getParameter("arguments").customerId;
        var that = this;
        oSettingsModel.attachRequestCompleted(function() {
            var serviceURL = this.getProperty("/oDataUrl");
            oModel = new sap.ui.model.odata.v2.ODataModel(serviceURL);
            oModel.setSizeLimit(100000000);
            var oView = that.getView();
            oView.setModel(oModel, "md");
            oView.setModel(new JSONModel({
                globalFilter: ""
            }), "ui");
            
            that.fetchBackendData(oModel, customerId);
            that.loadFragment();
//				that.getView().byId("passwordResetButton").setVisible(false);
//				sap.ui.getCore().byId("__xmlview0--createCustomerButton").setVisible(false);
            sap.ui.getCore().byId("__xmlview0--createUserButton").setVisible(false);
            sap.ui.getCore().byId("__xmlview0--onNavCustomerButton").setVisible(false);
        });
        
    },
    
    fetchBackendData : function(oModel, customerId){
        var that = this;
        oModel.read("/ClientEntitySet('" + customerId + "')", {
            success : function(oData) {
                that.bindDataToBox(oData);
                
            }
        });
    }, 
    
    bindDataToBox : function(oData) {
        /*var oBox = this.getView().byId("infoBox");
        var oModel = new JSONModel();
        
        var data = {
                STREET : 
                HOUSE_NO : ,
                POSTL_COD1 : ,
                CITY : ,
                COUNTRY : ,
                
            };
        oModel.setData(data);
        
        oBox.setModel(oModel);*/
        //this.getView().byId("AnschlussDate").setDateValue(oData.FOUNDATIONDATE);
        //this.getView().byId("KuendigungDate").setDateValue(oData.LIQUIDATIONDATE);
        this.getView().byId("StrasseInput").setValue(oData.STREET);
        this.getView().byId("HausnumerInput").setValue(oData.HOUSE_NO);
        this.getView().byId("PLZInput").setValue(oData.POSTL_COD1);
        this.getView().byId("OrtInput").setValue(oData.CITY);
        this.getView().byId("LandBox").setSelectedKey(oData.COUNTRY);
        this.getView().byId("LandBox").fireChange();
    
        
        /*oModel.setProperty("/REGION", oData.REGION);
        this.getView().byId("BundeslandBox").fireChange();*/
    },
    
    onAfterRendering : function() {
        $(".sapMFlexBox, .sapMHBox").css("padding-left", "inherit");
        $(".sapMFlexBox, .sapMHBox").css("padding-bottom", "inherit");
        $("[id*=buttonsHBox]").css("padding-top", "inherit");
        $("[id*=buttonsHBox]").css("padding-bottom", "");
    },
    
});
});