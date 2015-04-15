var self;

Polymer({
    is: "el-admin",
    properties: {
        site: {
            type: Object,
            value: undefined,
            notify: true
        },
        selectedView: {
            type: String,
            value: undefined,
            notify: true,
            observer: 'viewChanged'
        },
        lastView: String
    },
    hostAttributes: {
        'class': "layout vertical fit"
    },
    ready: function () {
        self = this;

        var xhrAuth = document.createElement("core-request");

        this.selectedView = "viewLoading";

        xhrAuth.send({
            url: "/admin/auth"
        });

        xhrAuth.completes.then(function (response) {
            if (response === "new") {
                self.selectedView = "viewInstall";
            }
            else if (response === "true") {
                self.getSite();
            }
            else if (response === "false") {
                // show login
            }
            else {
                console.error(response);
            }
        }).catch(function (why) {
            console.error(why);
        });
    },
    home: function (event) {
        // core-selector does not respond if timeout is not set
        window.setTimeout(function () {
            self.selectedView = self.lastView;
        });
    },
    validateInputs: function (inputs) {
        for (var i = 0; i < inputs.length; i++) {
            if (!inputs[i].validity.valid) {
                inputs[i].focus();
                return false;
            }
        }
        return true;
    },
    getSite: function () {
        var xhrSite = document.createElement("core-request");

        xhrSite.send({
            url: "/admin/site",
            handleAs: "json"
        });

        xhrSite.completes.then(function (response) {
            if (response.Id !== undefined) {
                console.log("site", response);

                response.Pages.sort(function (x, y) {
                    return y.Order - x.Order;
                });

                self.site = response;

                self.$.header.removeAttribute("hidden");

                if (self.site.Pages !== null && self.site.Pages.length > 0) {
                    self.$.nav.removeAttribute("hidden");
                    self.selectedView = self.site.Pages[0].Name;
                }
                else
                    self.selectedView = "viewAddPage";
            }
            else
                console.error(response);
        }).catch(function (why) {
            console.error(why);
        })
    },
    viewChanged: function (newVal, oldVal) {
        if (oldVal !== undefined)
            if (oldVal.match(/^view/) === null)
                this.lastView = oldVal;

        document.querySelector("title").innerHTML = newVal.replace(/^view/, '').replace(/-/, ' ') + " - admin";

        // does not get pages first time if timeout is not set
        window.setTimeout(function () {
            var pages = Polymer.dom(self.$.nav).querySelectorAll("section");

            for (var i = 0; i < pages.length; i++) {
                pages[i].classList.remove("selected");

                if (pages[i].querySelector("p").innerHTML === newVal)
                    pages[i].classList.add("selected");
            }
        });
    },
    initProject: function (event) {
        var xhrInit = document.createElement("core-request"),
            fd = new FormData(),
            input = Polymer.dom(this.$.viewInstall).querySelector("input[name=name]"),
            button = Polymer.dom(this.$.viewInstall).querySelector("button");

        fd.append("name", input.value);


        if (this.validateInputs([input])) {
            button.innerHTML = "<paper-spinner active></paper-spinner>";
            button.blur();

            input.valid = null;

            xhrInit.send({
                url: "/admin/InitProject",
                method: "POST",
                body: fd
            });
        }

        xhrInit.completes.then(function (response) {
            button.innerHTML = "<core-icon icon='check' alt='done'></core-icon>";

            if (response === 'true') {
                self.ready();
            }
            else {
                console.error(response);
            }
        }).catch(function (why) {
            console.error(why);
        });
    },
    addPage: function (event) {
        var xhrPage = document.createElement("core-request"),
            fd = new FormData(),
            name = Polymer.dom(this.$.viewAddPage).querySelector("input[name=name]"),
            status = Polymer.dom(this.$.viewAddPage).querySelector(".status"),
            btn = Polymer.dom(this.$.viewAddPage).querySelector("button"),
            pages = this.site.Pages;

        fd.append("name", name.value);


        if (pages !== null && pages.length > 0)
            fd.append("order", (pages[0].Order + 1));
        else
            fd.append("order", 0);

        if (this.validateInputs([name])) {
            name.value = null;

            btn.innerHTML = "<paper-spinner active></paper-spinner>";
            btn.blur();

            xhrPage.send({
                url: "/admin/addPage",
                body: fd,
                method: "POST"
            });
        }

        xhrPage.completes.then(function (response) {
            btn.innerHTML = "<core-icon icon='check' alt='done'></core-icon>";
            status.innerHTML = "";

            if (response === "true")
                self.ready();
            else if (response === "false")
                status.innerHTML = "page name is already taken";
            else
                console.error(response);
        }).catch(function (why) {
            console.error(why);
        });
    },
    deletePage: function (event) {
        var xhrDeletePage = document.createElement("core-request"),
            fd = new FormData(),
            id,
            btn;

        if (event.target.getAttribute("icon") !== null)
            btn = event.target.parentNode;
        else
            btn = event.target;

        fd.append("id", btn.getAttribute("data-id"));

        xhrDeletePage.send({
            url: "/admin/deletepage",
            method: "POST",
            body: fd
        });

        xhrDeletePage.completes.then(function (response) {
            if (response === "true")
                self.ready();
            else
                console.error(response);
        }).catch(function (why) {
            console.error(why);
        });
    },
    selectPage: function (event) {
        this.selectedView = event.target.innerHTML;
    },
    toggleAdd: function (event) {
        if (this.$.options.getAttribute("hidden") == null)
            this.$.options.setAttribute("hidden", "");
        else
            this.$.options.removeAttribute("hidden");
    },
    showAddPage: function (event) {
        this.selectedView = "viewAdd-Page";
    },
    showSelectComponent: function (event) {
        var select = Polymer.dom(this.$.viewSelectComponent).querySelector("select");

        for (var i = 0; i < this.site.Components.length; i++) {
            var component = this.site.Components[i];

            select.innerHTML += "<option value='" + component.Name + "'>" + component.Name + "</options>";
        }

        this.selectedView = "viewSelect-Component";
    },
    showAddComponent: function (event) {
        var select = Polymer.dom(this.$.viewSelectComponent).querySelector("select"),
            selected = this.site.Components[select.selectedIndex],
            component = Polymer.dom(this.$.viewComponent).querySelector("el-component");

        component._Id = selected.Id;
        component.Name = selected.Name;
        component.Properties = selected.Properties;

        window.setTimeout(function () {
            self.selectedView = "viewComponent";
        });
    }
})