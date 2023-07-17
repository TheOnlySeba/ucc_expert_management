sap.ui.define(
  ["sap/ui/core/UIComponent", "sap/ui/model/resource/ResourceModel"],
  function (UIComponent, ResourceModel) {
    "use strict";

    return UIComponent.extend("iService_UI5.Component", {
      metadata: {
        manifest: "json",
      },

      init: function () {
        // call the init-function of the parent
        UIComponent.prototype.init.apply(this, arguments);
        this.getRouter().initialize();

        var i18nModel = new ResourceModel({
          bundleName: "iService_UI5.i18n.i18n",
        });
        this.setModel(i18nModel, "i18n");
      },

      createContent: function () {
        var oViewData = {
          component: this,
        };

        return sap.ui.view({
          viewName: "iService_UI5.view.App",
          type: sap.ui.core.mvc.ViewType.XML,
          viewData: oViewData,
        });
      },
    });
  }
);
