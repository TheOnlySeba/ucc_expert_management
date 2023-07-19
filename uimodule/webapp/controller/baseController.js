sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/m/MessageToast"

], function (Controller, History, MessageToast) {
	"use strict";
	var oModeloData;
	var oModel;
	var userId;
	var isAuthorized;

	return Controller.extend("iService_UI5.controller.BaseController", {

		onInit: function () {

			/*oSettingsModel.loadData(sPath);
			var that = this;
			oSettingsModel.attachRequestCompleted(function(){
				
				that._model = this;
				
			});*/

			this.FOUNDATIONFLAG = false;
			this.LIQUIDATIONFLAG = false;
		},

		initializeUModel: function () {
			var oSettingsModel = this.getSettingsModel();
			var that = this;
			var translator = this.getView().getModel("i18n").getResourceBundle();
			oSettingsModel.attachRequestCompleted(function () {
				var serviceURL = this.getProperty("/oDataUrl");
				oModel = new sap.ui.model.odata.v2.ODataModel(serviceURL);
				oModeloData = oModel;

			});
		},

		getSettingsModel: function () {
			var sPath = $.sap.getModulePath("iService_UI5", "/model/applicationProperties.json");
			var oSettingsModel = new sap.ui.model.json.JSONModel();
			oSettingsModel.loadData(sPath);
			oModel = oSettingsModel;
			return oModel;
		},

		getRouter: function () {
			return sap.ui.core.UIComponent.getRouterFor(this);
		},

		onNavBack: function (oEvent) {

			sap.ui.getCore().byId("__xmlview0--createUserButton").setVisible(false);
			var oHistory, sPreviousHash;

			oHistory = History.getInstance();
			sPreviousHash = oHistory.getPreviousHash();

			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				this.onNavHome();
			}
		},

		onNavHome: function () {

			sap.ui.getCore().byId("__xmlview0--createUserButton").setVisible(false);
			this.getRouter().navTo("home", {}, true /*no history*/);

		},

		createExpert: function () {
			this.getRouter().navTo("createExpert", {}, true);
		},

		createLabel: function () {
			var target = window.location.href.split("/");
			this.getRouter().navTo("createLabel", {}, true);
		},

		navigateToExpertView: function () {
			this.getRouter().navTo("expert")
		},

		navigateToLabelView: function () {
			this.getRouter().navTo("label")
		},

		onChangeFoundationdate: function () {
			this.FOUNDATIONFLAG = true;
		},

		onChangeLiquidationdate: function () {
			this.LIQUIDATIONFLAG = true;
		},

	});
});