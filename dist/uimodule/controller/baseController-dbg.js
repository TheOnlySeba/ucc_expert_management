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
				oModel.callFunction("/GetUname", {
					"method": "GET",

					success: function (oData, oResponse) {
						var oUserModel = new sap.ui.model.json.JSONModel();
						oUserModel.setData(oData);
						that.getView().setModel(oUserModel, "userModel");

						userId = oData.UId;
						isAuthorized = oData.isAuthorized;

						if (!oData.isAuthorized) {
							// user have to set new password --> call dialog-window
							that.initializePassword();
						}
					},
					error: function (oError) {
						sap.m.MessageToast.show(translator.getText("noMatches"));
					}
				});
			});
		},

		initializePassword: function () {
			if (!this._passwortDialog) {
				this._passwortDialog = sap.ui.xmlfragment("iService_UI5.fragment.DialogResetPasswort", this);
				this._passwortDialog.setModel(this.getView().getModel("md"), "md");
				this.getView().addDependent(this._passwortDialog);
			}

			var translator = this.getView().getModel("i18n").getResourceBundle();

			// open dialog, set ValueStates to null, change title, forbid to close the window via escape- or 'Abbrechen'-button.
			this._passwortDialog.open();
			this._passwortDialog.setTitle(translator.getText("ChangePassFromInit"));	// change the title from default one
			this._passwortDialog.getAggregation("content")[1].setValueState("None");	// set value states to all input-fields
			this._passwortDialog.getAggregation("content")[3].setValueState("None");
			this._passwortDialog.getAggregation("content")[5].setValueState("None");
			this._passwortDialog.setEscapeHandler(null);								// disable exit from window by clicking on escape-button or 'Cancel'-Button
			this._passwortDialog.onsapescape = null;
			this._passwortDialog.destroyEndButton();
			this._passwortDialog.getAggregation("content")[7].setEnabled(false);		// disable and hide the 'Cancel'-Button
			this._passwortDialog.getAggregation("content")[7].setVisible(false);
		},

		onResetButton: function () {
			var that = this;
			var oldPassword = this._passwortDialog.getAggregation("content")[1].getValue();
			var password1 = this._passwortDialog.getAggregation("content")[3].getValue();
			var password2 = this._passwortDialog.getAggregation("content")[5].getValue();
			var translator = this.getView().getModel("i18n").getResourceBundle();
			if (this.isCorrectPasswords(that, oldPassword, password1, password2)) {
				var that = this;

				oModeloData.callFunction("/ResetPasswort", {
					"method": "POST",
					urlParameters: {
						user: userId,
						oldPass: oldPassword,
						pass1: password1,
						pass2: password2
					},
					success: function (oData, oResponse) {
						MessageToast.show(translator.getText("passChangeSuccess"));
						that._passwortDialog.close();
					},
					error: function (oError) {
						MessageToast.show(translator.getText("passChangeError") + JSON.parse(oError.responseText).error.message.value);
						console.log(oError);
					}
				});
			}
		},

		isCorrectPasswords: function (that, oldPassword, password1, password2) {
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

		createCustomer: function () {
			this.getRouter().navTo("createCustomer", {}, true);
		},

		createUser: function () {
			var target = window.location.href.split("/");
			this.getRouter().navTo("createUser", { customerId: target[target.length - 1] }, true);
		},

		onNavCustomer: function () {
			var target = window.location.href.split("/");
			this.getRouter().navTo("customer", { customerId: target[target.length - 3] }, true);
		},

		navigateToSelfInstitution: function () {
			var myInst = sap.ui.getCore().byId("__xmlview0").getModel("userModel").getData().UInst;
			this.getRouter().navTo("customer", { customerId: myInst }, true);
		},


		navigateToSelfUser: function () {
			var myInst = sap.ui.getCore().byId("__xmlview0").getModel("userModel").getData().UInst;
			var myUser = sap.ui.getCore().byId("__xmlview0").getModel("userModel").getData().UId;
			this.getRouter().navTo("user", { userId: myUser, customerId: myInst }, true);
		},

		onNavSystemAllocation: function () {
			this.getRouter().navTo("systemAllocation")
		},

		onNavProductOverview: function () {
			this.getRouter().navTo("productOverview")
		},

		onNavProductOptions: function () {
			this.getRouter().navTo("productOptions")
		},

		onNavContract: function () {
			this.getRouter().navTo("contractAllocation")
		},

		onChangeFoundationdate: function () {
			this.FOUNDATIONFLAG = true;
		},

		onChangeLiquidationdate: function () {
			this.LIQUIDATIONFLAG = true;
		},

	});
});