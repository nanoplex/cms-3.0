Polymer({
    is: "el-component",
    properties: {
        _Id: String,
        Name: String,
        nested: Boolean,
        Properties: {
            type: Object,
            value: undefined,
            notify: true
        }
    },
    listeners: {
        'property-changed': 'propChanged'
    },
    attached: function () {
        this.$.props.innerHTML = "";

        if (this.nested)
            this.querySelector("button").setAttribute("hidden", "");

        for (var i = 0; i < this.Properties.length; i++) {
            var prop = this.Properties[i],
                elProp = document.createElement("el-property");

            // name must be set last so all values are set when the observer fires
            elProp.Type = prop.Type;
            elProp.Value = prop.Value;
            elProp.Validation = prop.Validation;
            elProp.Name = prop.Name;

            this.propChanged({
                "detail": {
                    "Name": prop.Name,
                    "Type": prop.Type,
                    "Value": prop.Value
                }});

            Polymer.dom(this.$.props).appendChild(elProp);
        }
    },
    propChanged: function (event) {
        var prop = event.detail;

        for (var i = 0; i < this.Properties.length; i++) {
            var myProp = this.Properties[i];

            if (myProp.Name === prop.Name) {
                myProp.Value = prop.Value;
                this.setAttribute("properties", JSON.stringify(this.Properties));
                break;
            }
        }

        if (this.nested)
            this.fire("properties-changed", this.Properties);
    },
    finish: function (event) {
        if (this._Id === "000000000000000000000000")
            this.add();
        else
            this.edit();
    },
    add: function () {
        var xhrAdd = document.createElement("core-request"),
            fd = new FormData();

        fd.append("name", this.Name);
        fd.append("properties", this.getAttribute("properties"));
        fd.append("pageName", document.querySelector("el-admin").lastView);

        xhrAdd.send({
            url: "/admin/addcomponent",
            method: "POST",
            body: fd
        });

        xhrAdd.completes.then(function (response) {
            if (response === "true")
                document.querySelector("el-admin").ready();
        }).catch(function (why) {
            console.error(why);
        });
    },
    edit: function () {
        var xhrEdit = document.createElement("core-request"),
            fd = new FormData();

        fd.append("id", this._Id);
        fd.append("properties", this.getAttribute("properties"));

        xhrEdit.send({
            url: "/admin/editcomponent",
            method: "POST",
            body: fd
        });

        xhrEdit.completes.then(function (response) {
            if (response === "true")
                self.ready();
        }).catch(function (why) {
            console.error(why);
        });
    }
})