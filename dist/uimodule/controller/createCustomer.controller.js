sap.ui.define([ 
	"iService_UI5/controller/BaseController",
	"sap/ui/model/json/JSONModel", 
	"sap/m/MessageToast",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"

], function(Controller, JSONModel, MessageToast, Filter, FilterOperator) {
	"use strict";
	var oModel;
	var oFragment;
	var postCodeLength = [];
	return Controller.extend("iService_UI5.controller.createCustomer", {

		inputId: '',

		onInit : function(oData) {
			this.getOwnerComponent().getRouter().getRoute("createCustomer")
					.attachPatternMatched(this._onRouteMatched, this);
			
			sap.ui.getCore().byId("__xmlview0--createUserButton").setVisible(false);
		},

		_onRouteMatched : function(oEvent) {
			var oSettingsModel = this.getSettingsModel();
			var that = this;
			oSettingsModel.attachRequestCompleted(function() {
				var serviceURL = this.getProperty("/oDataUrl");
				oModel = new sap.ui.model.odata.v2.ODataModel(serviceURL);
				oModel.setSizeLimit(100000000);
				var oView = that.getView();
				oView.setModel(oModel, "md");
				oView.setModel(new JSONModel({
					globalFilter : ""
				}), "ui");

				that._oGlobalFilter = null;
				that._oStatusFilter = null;
				
				that.loadFragment();
				sap.ui.getCore().byId("__xmlview0--createUserButton").setVisible(false);
				sap.ui.getCore().byId("__xmlview0--onNavCustomerButton").setVisible(false);
			});
			
		},
		
		getHostingart : function() {
			var that = this;
			
			oModel.read("/HostingartSet", {
				filters : [new Filter("Bpkind", FilterOperator.EQ, 'X')],
				
				success : function(oData) {
					var oLabel = that.getView().byId("HostingartBox");
					oLabel.destroyItems();
					oData.results.forEach(function(oItem){
						var item = new sap.ui.core.Item();
						item.setKey(oItem.Bpkind);
						item.setText(oItem.Text40);
						oLabel.addItem(item);
					});
				}
			});
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
			if (!oFragment) {
				var oPanel = this.getView().byId("Kundendaten");
				oFragment = sap.ui.xmlfragment(this.getView().getId(), "iService_UI5.fragment.customer", this);
				oPanel.insertContent(oFragment);
			}
			this.toggleEditMode(true);
			this.getHostingart();
			this.getPostCodeLength();
		},
		
		handleValueHelp : function(oEvent) {
			
			var sInputValue = oEvent.getSource().getValue();
			
			this.inputId = oEvent.getSource().getId();
			
			// create value help dialog
			if (!this._valueHelpDialog) {
				this._valueHelpDialog = sap.ui.xmlfragment("iService_UI5.fragment.DialogHostedCustomers", this);
				this._valueHelpDialog.setModel(this.getView().getModel("md"), "md");
				this.getView().addDependent(this._valueHelpDialog);
			}
			
			// create a filter for the binding
			var oFilter = this.createFilter(sInputValue);			
			this._valueHelpDialog.getBinding("items").filter(oFilter);
			
			// open value help dialog filtered by the input value
			this._valueHelpDialog.open(sInputValue);
			
		},
		
		_handleValueHelpSearch : function (evt) {
			var sValue = evt.getParameter("value");
			var oFilter = this.createFilter(sValue);
			
			evt.getSource().getBinding("items").filter([oFilter]);
		},
		
		createFilter : function(sInputValue) {
				var oFilter =  new Filter({
			        path: 'NAME1',
			        operator: sap.ui.model.FilterOperator.Contains,
			        value1: sInputValue
			      });
				
				return oFilter;
		},
		
		_handleValueHelpClose : function (evt) {
			var oSelectedItem = evt.getParameter("selectedItem");
			if (oSelectedItem) {
				var productInput = this.byId(this.inputId);
				productInput.setValue(oSelectedItem.getTitle());
			}
			evt.getSource().getBinding("items").filter([]);
		},
		
		countryChange: function(oEvent){
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
							
				that.getView().byId("BundeslandBox").setSelectedKey("");
				that.getView().byId("BundeslandBox").destroyItems();
				
				oModel.read("/BundeslandSet", {
					filters : [
						new Filter({
							filters : [
								new Filter("Land1", FilterOperator.EQ, sQuery),
								new Filter("Spras", FilterOperator.EQ, sap.ui.getCore().getConfiguration().getLanguage())
							],
							and : true
						})
					],
					
					success : function(oData) {
						var oLabel = that.getView().byId("BundeslandBox");
						oLabel.destroyItems();
						oData.results.forEach(function(oItem){
							var item = new sap.ui.core.Item();
							item.setKey(oItem.Bland);
							item.setText(oItem.Bezei);
							oLabel.addItem(item);
						});
					}
				});
			}
		},

		onCreate : function() {
			
			var allData = this.collectData();
			var canChange = true;
			var that = this;
			var translator = this.getView().getModel("i18n").getResourceBundle();
			
			allData.forEach(function(oDataPiece) {
				if(oDataPiece.mProperties.value.trim().length == 0 &&
				!oDataPiece.getId().includes("KuendigungDate") &&
				!oDataPiece.getId().includes("Name_2Input") &&
				!oDataPiece.getId().includes("hostedByInput") &&
				!oDataPiece.getId().includes("BundeslandBox")) {
					oDataPiece.setValueState("Error");
					canChange = false;
				}
			});
			
			if(this.getView().byId("KuendigungDate").getValue() != "") {
				if(this.getView().byId("AnschlussDate").getDateValue() >
				this.getView().byId("KuendigungDate").getDateValue()) {
					canChange = false;
					this.getView().byId("AnschlussDate").setValueState("Error");
					this.getView().byId("KuendigungDate").setValueState("Error");
				}
			}
			
			// ensure that all ComoBoxes have a selected key (value was taken from dropdown-list and has a valid key)
			if(this.getView().byId("ArtBox").getSelectedKey() == "") {
				canChange = false;
				this.getView().byId("ArtBox").setValueState("Error");
			}
			if(this.getView().byId("HostingartBox").getSelectedKey() == "") {
				this.getView().byId("HostingartBox").setValueState("Error");
				canChange = false;
			}
			if(this.getView().byId("ProgramBox").getSelectedKey() == "") {
				this.getView().byId("ProgramBox").setValueState("Error");
				canChange = false;
			}
			if(this.getView().byId("LandBox").getSelectedKey() == "") {
				this.getView().byId("LandBox").setValueState("Error");
				canChange = false;
			}
			
			if(canChange) {
				var customerId = "placeholder";
				var oData = {
						CITY : this.getView().byId("OrtInput").getValue(),
						COUNTRY : this.getView().byId("LandBox").getSelectedKey(),
						FOUNDATIONDATE : this.getView().byId("AnschlussDate").getDateValue(),
						LIQUIDATIONDATE : this.getView().byId("KuendigungDate").getDateValue(),
						HOUSE_NO : this.getView().byId("HausnumerInput").getValue(),
						LEGALFORM : this.getView().byId("ArtBox").getSelectedKey(),
						NAME1 : this.getView().byId("Name_1Input").getValue(),
						NAME2 : this.getView().byId("Name_2Input").getValue(),
						PARTNERTYPE : this.getView().byId("HostingartBox").getSelectedKey(),
						HOSTEDBY : this.getView().byId("hostedByInput").getValue(),
						PROGRAM: this.getView().byId("ProgramBox").getSelectedKey(), 
						POSTL_COD1 : this.getView().byId("PLZInput").getValue(),
						Partner : customerId,
						STREET : this.getView().byId("StrasseInput").getValue(),
						URI : this.getView().byId("HomeInput").getValue(),
						REGION : this.getView().byId("BundeslandBox").getSelectedKey(),
						STATUS : this.getView().byId("imAnschlussProzessCheckBox").getSelected() ? "im Anschluss" : "aktiv"
				};

				oModel.create("/ClientEntitySet", oData, {
					success : function(oData, oResponse) {
						
						that.getView().byId("Name_1Input").setValue("");
						that.getView().byId("Name_2Input").setValue("");
						that.getView().byId("HomeInput").setValue("");
						that.getView().byId("ArtBox").setValue("");
						that.getView().byId("HostingartBox").setValue("");
						that.getView().byId("hostedByInput").setValue("");
						that.getView().byId("AnschlussDate").setValue("");
						that.getView().byId("KuendigungDate").setValue("");
						that.getView().byId("StrasseInput").setValue("");
						that.getView().byId("HausnumerInput").setValue("");
						that.getView().byId("PLZInput").setValue("");
						that.getView().byId("OrtInput").setValue("");
						that.getView().byId("LandBox").setValue("");
						that.getView().byId("BundeslandBox").setValue("");
						that.getView().byId("ProgramBox").setValue("");
						
						that.getRouter().navTo(
							"customer", {
								customerId : oData.Partner
							});
						MessageToast.show(translator.getText("customerWithId") + oData.Partner + translator.getText("createSuccess"));
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

		toggleEditMode : function(enable){
			var allData = this.collectData();
			
			allData.forEach(function(oDataPiece) {
				oDataPiece.setEditable(enable);
				oDataPiece.setValueState("None");
			});

		},
		
		collectData : function() {
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
		
		onAfterRendering : function(){
			$(".sapMFlexBox, .sapMHBox").css("padding-left", "inherit");
			$(".sapMFlexBox, .sapMHBox").css("padding-bottom", "inherit");
			$("[id*=buttonsVBox]").css("padding-top", "inherit");
			$("[id*=buttonsVBox]").css("padding-bottom", "");
		},
		
	});
});