Polymer({
    is: "component-property",
    properties: {
        name: String,
        type: String,
        value: {
            type: Object,
            observer: "valueChanged"
        },
        simple: {
            type: Boolean,
            value: true
        },
        array: {
            type: Boolean,
            value: true
        },
        bool: {
            type: Boolean,
            value: true
        },
        b: Boolean
    },
    ready: function () {
        var value = this.value,
            type = this.type;

        if (type === "array")
            this.array = false;
        else if (type === "object")
            this.initObject();
        else if (type === "boolean") {
            this.bool = false;
            this.b = (value === "False") ? false : true;
        } else
            this.simple = false;
    },
    initObject: function () {
        var elObj = this.$.object,
            value = this.value;

        value = JSON.parse(value);

        elObj.innerHTML = "<label>" + this.name + "</label>";

        for (var prop in value) {
            var property = document.createElement("component-property"),
                val = value[prop],
                type = typeof val;

            if (Array.isArray(val))
                type = "array";

            property.name = prop;
            property.type = type;
            property.value = val;

            elObj.appendChild(property);
        }
    },
    updateValue: function (event) {
        this.value = event.target.value || event.target.checked;

        this.fire("property-changed");
    },
    valueChanged: function (n, o) {
        if (this.type === "object") {
            var props = this.$.object.querySelectorAll("component-property"),
            value = "{";

            for (var i = 0, length = props.length; i < length; i++) {
                var prop = props[i];
                value += '"' + prop.name + '":"' + prop.value + '",';
            }

            this.value = value.replace(/,$/, "") + "}";

            this.fire("property-changed");
        }
    }
});