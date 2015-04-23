Polymer({
    is: "el-property",
    properties: {
        Name: {
            type: String,
            value: undefined,
            notify: true,
            observer: "init"
        },
        Value: {
            type: Object,
            value: undefined,
            notify: true,
            reflectToAttribute: true
        },
        Type: String,
        Validation: String,
        isComponent: {
            type: Boolean,
            value: false,
            notify: false
        }
    },
    init: function () {

        if (this.Type === "string") {
            this.$.input.setAttribute("type", "text");
        }
        else if (this.Type === 'longString') {
            this.$.input.setAttribute("hidden", "");
            this.$.textbox.removeAttribute("hidden");
        }
        else if (this.Type === 'int') {
            this.$.input.setAttribute("type", "number");
        }
        else if (this.Type === 'boolean') {
            this.$.input.setAttribute("type", "checkbox");
            this.listen(this.$.input, "change", "input");
        }
        else if (this.Type === 'image')
            this.$.input.setAttribute("type", "file");
        else {
            var elComponent = document.createElement("el-component");

            this.$.input.setAttribute("hidden", "");

            this.isComponent = true;

            if (this.Value === null) {
                var admin = document.querySelector("el-admin");

                for (var i = 0; i < admin.site.Components.length; i++) {
                    var component = admin.site.Components[i];

                    if (component.Name === this.Type) {
                        this.Value = component.Properties;
                        break;
                    }
                }
            }
            else {
                this.Value = JSON.parse(this.Value);
            }

            this.listen(elComponent, "properties-changed", "input");
            elComponent.Name = this.Name;
            elComponent.Properties = this.Value;
            elComponent.nested = true;

            this.appendChild(elComponent);
        }

        if (this.Validation !== "false")
            this.$.input.setAttribute("required", "");

        if (this.Validation !== "false" && this.Validation !== "true")
            this.$.input.setAttribute("pattern", this.Validation);

        if (this.isComponent)
            this.input({ "detail": elComponent.Properties });
        else if (this.Type === 'longString') {
            this.$.textbox.value = this.Value;
            this.input({ "target": this.$.textbox });
        }
        else if (this.Type !== 'image') {
            this.$.input.value = this.Value;
            this.input({ "target": this.$.input });
        }
    },
    input: function (event) {

        if (this.Type === 'boolean') {
            this.Value = event.target.checked;
        }
        else if (this.isComponent) {
            this.Value = JSON.stringify(event.detail);
        }
        else
            this.Value = event.target.value;

        this.fire("property-changed", {
            "Name": this.Name,
            "Type": this.Type,
            "Value": this.Value
        });
    },
});