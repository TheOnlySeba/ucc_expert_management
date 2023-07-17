sap.ui.define([
	"iService_UI5/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/core/format/DateFormat",
	"sap/ui/core/util/Export",
	"sap/ui/core/util/ExportTypeCSV"
], function (Controller, JSONModel, Filter, FilterOperator, DateFormat) {
	"use strict";

	var initial = true;
	var tmpData;

	return Controller.extend("iService_UI5.controller.main", {

		onInit: function () {

			this.getOwnerComponent().getRouter().getRoute("home").attachPatternMatched(this._onRouteMatched, this);



		},

		_onRouteMatched: function (oEvent) {

			var oSettingsModel = this.getSettingsModel();
			var that = this;
			oSettingsModel.attachRequestCompleted(function () {
				var serviceURL = this.getProperty("/oDataUrl");
				var oModel = new sap.ui.model.odata.v2.ODataModel(serviceURL);
				var oView = that.getView();
				oModel.refresh();
				oView.setModel(oModel); // Kommentar Sebastian: warum 2x setModel()?
				oView.setModel(new JSONModel({ //
					globalFilter: "",
					availabilityFilterOn: false,
					cellFilterOn: false
				}), "ui");

				that._oGlobalFilter = null;

				var fnPress = that.handleNavigationPress.bind(that);
				oView.byId("iServiceTable").setRowActionTemplate(
					new sap.ui.table.RowAction({
						items: [new sap.ui.table.RowActionItem({
							type: "Navigation",
							press: fnPress,
							visible: true
						})]
					})
				);
				oView.byId("iServiceTable").setRowActionCount(1);
				if (!initial) {

					that.clearAllFilters();
				}
				initial = false;

				sap.ui.getCore().byId("__xmlview0--createUserButton").setVisible(false);
				//				sap.ui.getCore().byId("__xmlview0--createCustomerButton").setVisible(true);
				sap.ui.getCore().byId("__xmlview0--onNavCustomerButton").setVisible(false);
			});

		},


		handleNavigationPress: function (oEvent) {
			var oRow;

			oRow = oEvent.getParameter("row");

			if (!oRow) {
				oRow = oEvent.getSource().getParent();
			}

			this.getRouter().navTo("customer", {
				customerId: oRow.getCells()[0].getProperty("text")
			});
		},

		selectFilter: function (oEvent) {
			this.triggerFilter(this.getView().byId("globalSearch").getValue(), this.getView().byId("aktiv").getSelected(), this.getView().byId("anschluss").getSelected(), this.getView().byId("geloescht").getSelected());
		},

		triggerFilter: function (query, aktiv, im_anschluss, geloescht) {
			var that = this;
			var filters = [];
			var translator = this.getView().getModel("i18n").getResourceBundle();
			/*var columns = this.getView().byId("iServiceTable").getColumns();
			
			for(var i=0; i<columns.length; i++){
				if(columns[i]._getFilter()){
					filters[i] = columns[i]._getFilter();
				}
			}*/

			var oModel = this.getView().getModel();
			oModel.callFunction("/FilterQuery", {
				"method": "GET",
				urlParameters: {
					search: query,
					status_aktiv: aktiv,
					status_im_anschluss: im_anschluss,
					status_geloescht: geloescht
				},
				success: function (oData, oResponse) {
					tmpData = oData;
					if (oData.results.length === 1 && oData.results[0].Navstr !== "") {
						//var params = oData.results[0].Navstr.split("****");
						var userId = oData.results[0].Partner;
						var customerId = window.location.href.split("/");

						that.getRouter().navTo("user", {
							userId: userId,
							customerId: customerId[customerId.length - 1]
						});
					} else {
						that.bindDataToTable(oData);
						that.getView().byId("iServiceTable").getColumns().forEach(function (column) {
							if (column.getFilterValue()) {
								that.getView().byId("iServiceTable").filter(column, column.getFilterValue())
							}
						});
					}
				},
				error: function (oError) {
					sap.m.MessageToast.show(translator.getText("noMatches"));
				}
			});

		},

		filterGlobally: function (oEvent) {
			this.triggerFilter(oEvent.getParameter("query"), this.getView().byId("aktiv").getSelected(), this.getView().byId("anschluss").getSelected(), this.getView().byId("geloescht").getSelected());
		},

		bindDataToTable: function (oData) {
			var oTable = this.getView().byId("iServiceTable");
			var searchQuery = [];
			var oModel = new JSONModel();
			oData.results.forEach(function (oDataPiece) {
				searchQuery.push({
					"Partner": oDataPiece.Partner,
					"NameOrgFull": oDataPiece.NameOrgFull,
					"Adresse": oDataPiece.Adresse,
					"PostCode1": oDataPiece.PostCode1,
					"City1": oDataPiece.City1,
					"LandX": oDataPiece.LandX,
					"GoogleMaps": oDataPiece.GoogleMaps,
					"Status": oDataPiece.Status
				});
			});
			oModel.setData({
				searchQuery: searchQuery
			});
			oTable.setModel(oModel);
			oTable.bindRows("/searchQuery");
		},

		_filter: function () {
			var oFilter = null;
			var oTable = this.getView().byId("iServiceTable");

			if (this._oGlobalFilter) {
				oFilter = this._oGlobalFilter;
			} else {

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
			var oTable = this.byId("iServiceTable");

			var oUiModel = this.getView().getModel("ui");
			oUiModel.setProperty("/globalFilter", "");

			this._oGlobalFilter = null;
			this.triggerFilter("", this.getView().byId("aktiv").getSelected(), this.getView().byId("anschluss").getSelected(), this.getView().byId("geloescht").getSelected());
			this._filter();

			var aColumns = oTable.getColumns();
			for (var i = 0; i < aColumns.length; i++) {
				oTable.filter(aColumns[i], null);
			}
		},

		exportcsv: sap.m.Table.prototype.exportData || function (oData) {
			var oModel = new JSONModel();
			oModel.setData(tmpData);
			var oExport = new sap.ui.core.util.Export({
				exportType: new sap.ui.core.util.ExportTypeCSV({
					separatorChar: ",",
					charset: "utf-8"
				}),
				models: oModel,
				rows: {
					path: "/results"
				},
				columns: [
					{
						name: this.getView().getModel("i18n").getProperty("customerId"),
						template: {
							content: "{Partner}"
						}
					},
					{
						name: this.getView().getModel("i18n").getProperty("institution"),
						template: {
							content: "{NameOrgFull}"
						}
					},
					{
						name: this.getView().getModel("i18n").getProperty("address"),
						template: {
							content: "{Adresse}"
						}
					},
					{
						name: this.getView().getModel("i18n").getProperty("postCode"),
						template: {
							content: "{PostCode1}"
						}
					},
					{
						name: this.getView().getModel("i18n").getProperty("city"),
						template: {
							content: "{City1}"
						}
					},
					{
						name: this.getView().getModel("i18n").getProperty("country"),
						template: {
							content: "{LandX}"
						}
					},
					{
						name: this.getView().getModel("i18n").getProperty("display"),
						template: {
							content: "{GoogleMaps}"
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

		},



	});

});