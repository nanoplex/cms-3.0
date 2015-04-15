﻿Polymer({
    is: "el-property",
    properties: {
        Name: {
            type: String,
            value: undefined,
            notify: true,
            observer: "init"
        },
        Type: String,
        Value: {
            type: Object,
            value: undefined,
            notify: true,
            reflectToAttribute: true
        },
        Validation: String
    },
    init: function () {
        console.log("type", this.Type);

        if (this.Type === "string")
            this.$.input.setAttribute("type", "text");
        else if (this.Type === 'longString') {
            this.$.input.setAttribute("hidden", "");
            this.$.textbox.removeAttribute("hidden");
        }
        else if (this.Type === 'int')
            this.$.input.setAttribute("type", "number");
        else if (this.Type === 'boolean')
            this.$.input.setAttribute("type", "checkbox");
        else if (this.Type === 'image')
            this.$.input.setAttribute("type", "file");
        else {
            var elComponent = document.createElement("el-component");

            this.$.input.setAttribute("hidden", "");

            if (this.Value === null) {
                var admin = document.querySelector("el-admin");

                for (var i = 0; i < admin.site.Components.length; i++) {
                    var component = admin.site.Components[i];

                    if (component.Name === this.Type) {
                        this.Value = component;
                        break;
                    }
                }
            }

            this.listen(elComponent, "properties-changed", this.componentInput);
            elComponent._Id = this.Value.Id;
            elComponent.Name = this.Value.Name;
            elComponent.Properties = this.Value.Properties;
            elComponent.nested = true;

            this.appendChild(elComponent);
        }

        if (this.Validation !== "false")
            this.$.input.setAttribute("required", "");

        if (this.Validation !== "false" && this.Validation !== "true")
            this.$.input.setAttribute("pattern", this.Validation);

        this.$.input.value = this.Value;
    },
    input: function (event) {
        if (this.Type === 'boolean') {
            this.Value = event.target.checked;
        }
        else
            this.Value = event.target.value;

        this.fire("property-changed", {
            "Name": this.Name,
            "Type": this.Type,
            "Value": this.Value
        });
    },
    componentInput: function (event) {
        this.Value = event.detail;
    }
});