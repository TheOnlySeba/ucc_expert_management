sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/ui/core/UIComponent"


], function (Controller, History) {
	"use strict";

	var oModel;

	return Controller.extend("iService_UI5.controller.App", {



		// change i18n (language) to english on website
		changeLangToEN: function () {
			var lang = "E";
			sap.ui.getCore().getConfiguration().setLanguage("EN");	// sets language-settings for views (does not change language on backend and URL)
			this.toggleDropDowns(lang);
		},

		// change i18n (language) to german on website
		changeLangToDE: function () {
			var lang = "D";
			sap.ui.getCore().getConfiguration().setLanguage("DE");	// sets language-settings for views (does not change language on backend and URL)
			this.toggleDropDowns(lang);
		},

		// toggle all drop-downs to change their language to selected one (backend-call)
		toggleDropDowns: function (lang) {

			// customer- and createCustomer-views
			this.changeLang(lang, 'Spras', sap.ui.getCore().byId("webapp---createCustomer--ArtBox"), "/ArtSet");	// change language of ArtBox in createCustomer-view
			this.changeLang(lang, 'Spras', sap.ui.getCore().byId("webapp---customer--ArtBox"), "/ArtSet");			// change language of ArtBox in customer-view
			this.changeLang(lang, 'Spras', sap.ui.getCore().byId("webapp---createCustomer--LandBox"), "/LandSet");	// change language of Country-name in createCustomer-view
			this.changeLang(lang, 'Spras', sap.ui.getCore().byId("webapp---customer--LandBox"), "/LandSet");		// change language of Country-name in customer-view

			// by changing language - remove selected Province- (Bundesland-) Name (otherwise it still be in previous language)
			var createCustLand = sap.ui.getCore().byId("webapp---createCustomer--LandBox");
			var createCustBundesl = sap.ui.getCore().byId("webapp---createCustomer--BundeslandBox");

			// for createCustomer-view
			if (createCustLand !== undefined && createCustBundesl !== undefined) {
				createCustLand.clearSelection();
				createCustLand.setValue("");
				createCustBundesl.clearSelection();
				createCustBundesl.setValue("");
			}

			// user- and createUser-views
			this.changeLang(lang, 'Langu', sap.ui.getCore().byId("webapp---user--AnredeBox"), "/AnredeSet");						 // change language of Salutation (Anrede) in user-view
			this.changeLang(lang, 'Langu', sap.ui.getCore().byId("webapp---createUser--AnredeBox"), "/AnredeSet");					 // change language of Salutation (Anrede) in CreateUser-view
			this.changeLang(lang, 'Spras', sap.ui.getCore().byId("webapp---user--FachrichtungBox"), "/FachrichtungSet");			 // change language of Field of study (Fachrichtung) in user-view
			this.changeLang(lang, 'Spras', sap.ui.getCore().byId("webapp---createUser--FachrichtungBox"), "/FachrichtungSet");		 // change language of Field of study (Fachrichtung) in createUser-view
			this.changeLang(lang, 'Spras', sap.ui.getCore().byId("webapp---user--SpezialisierungBox"), "/SpezialisierungSet");		 // change language of Specialisation (Spezialisierung) in user-view
			this.changeLang(lang, 'Spras', sap.ui.getCore().byId("webapp---createUser--SpezialisierungBox"), "/SpezialisierungSet"); // change language of Specialisation (Spezialisierung) in createUser-view
			this.changeLang(lang, 'Spras', sap.ui.getCore().byId("webapp---user--LandBox"), "/LandSet");							 // change language of Country-name in user-view
			this.changeLang(lang, 'Spras', sap.ui.getCore().byId("webapp---createUser--LandBox"), "/LandSet");						 // change language of Country-name in createUser-view

		},

		// changes language for all drop-downs of current view
		changeLang: function (language, filterPath, dropDownId, backendComponentSet) {

			// create Filter
			var that = this;
			var oFilter = new Filter({
				path: filterPath,
				operator: sap.ui.model.FilterOperator.EQ,
				value1: language,
			});

			// call function with language-filters to get from backend correct (language) field-names for drop-downs
			var mParameters = {
				success: function (oData, oResponse) {
					if (dropDownId !== undefined) {			// need to check because we can edit view with no such field!
						dropDownId.getBinding("items").filter(oFilter);
					}
				},
				error: function (oError) {
					console.log(oError);
				}
			};

			oModel.read(backendComponentSet, mParameters);
		},

		onAfterRendering: function () {
			$(".sapFDynamicPageContent, .sapFDynamicPageContentFitContainer").css("padding", "0 0 0 0");

		},
		navigateToExpertView: function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("expert");
		},

		navigateToLabelView: function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("label");
		},


	});

});