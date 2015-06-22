Polymer({
    is: "component-property",
    properties: {
        name: String,
        type: String,
        nested: Boolean,
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
            this.initArray();
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
            property.nested = true;

            elObj.appendChild(property);
        }
    },
    initArray: function () {
        var elArray = this.$.array,
          array = JSON.parse(this.value),
          arrayType = typeof array[0],
          add = document.createElement("section"),
          that = this;

        elArray.innerHTML = "<label>" + this.name + "</label>";

        var elValue,
            getElValue = function(i) {
                elValue = document.createElement("article");
                elValue.className = "style-scope component-property";
                elValue.innerHTML = "<div class='layout horizontal center'>" +
                        that.getValue(array[i]) +
                        "<button class='btn self-end'><iron-icon icon='close'></iron-icon></button>" +
                    "</div>";

                elValue.querySelector("button").addEventListener("click", function() {
                    that.deleteArrayItem(i);
                });
                elArray.appendChild(elValue);
            };

        for (var i = 0, length = array.length; i < length; i++) {
            getElValue(i);
        }

        add.className = "layout horizontal center style-scope component-property";
        add.innerHTML = "<component-property class='flex' name='new " + this.name + "' type='" + arrayType + "' nested='true'>" + "</component-property>" + "<button class='btn'><iron-icon icon='add'></iron-icon></button>";

        add.querySelector("button").addEventListener("click", function () {
            that.addArrayItem(this.previousElementSibling.value, arrayType);
        });

        elArray.appendChild(add);
    },
    addArrayItem: function (value, arrayType) {
        var val = JSON.parse(this.value);

        val.push(value);

        this.value = JSON.stringify(val);
    },
    deleteArrayItem: function (index) {
        var val = JSON.parse(this.value);

        val.splice(index, 1);

        this.value = JSON.stringify(val);
    },
    getValue: function (value) {
        var type = typeof value,
            str = "";

        if (type === "object") {
            if (Array.isArray(value)) {
                for (var i = 0, length = value.length; i < length; i++) {
                    str += this.getValue(value[i]);
                }
            } else {
                for (var prop in value) {
                    str += this.getValue(value[prop]);
                }
            }
        } else {
            str = "<p class='style-scope component-property'>" + value + "</p>";
        }

        return str;
    },
    updateValue: function (event) {
        this.value = event.target.value || event.target.checked;

        if (!this.nested) this.fire("property-changed");
    },
    valueChanged: function (n, o) {
        var type = this.type;

        if (type === "object") {
            var props = this.$.object.querySelectorAll("component-property"),
            value = "{";

            for (var i = 0, length = props.length; i < length; i++) {
                var prop = props[i];
                value += '"' + prop.name + '":"' + prop.value + '",';
            }

            this.value = value.replace(/,$/, "") + "}";

            this.fire("property-changed");
        } else if (type === "array") {
            this.initArray();

            this.fire("property-changed");
        }
    }
});