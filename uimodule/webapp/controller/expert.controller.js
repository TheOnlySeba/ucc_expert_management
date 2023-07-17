sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast"
], function (Controller, MessageToast) {
    "use strict";

    return Controller.extend("Service_UI5.controller.expert", {
        onInit: function () {
            //Initialization code
        },

        onCreateExpert: function () {
            //Code for creating a new expert
            MessageToast.show("Create function not implemented");
        },

        onUpdateSelectedExpert: function () {
            //Code for updating the selected expert
            MessageToast.show("Update function not implemented");
        },

        onDeleteSelectedExpert: function () {
            //Code for deleting the selected expert
            MessageToast.show("Delete function not implemented");
        }
    });
});
