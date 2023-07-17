sap.ui.define(["sap/ui/test/Opa5"], function (Opa5) {
    "use strict";

    return Opa5.extend("abapLab.ababLab.test.integration.arrangements.Startup", {
        iStartMyApp: function () {
            this.iStartMyUIComponent({
                componentConfig: {
                    name: "abapLab.ababLab",
                    async: true,
                    manifest: true
                }
            });
        }
    });
});
