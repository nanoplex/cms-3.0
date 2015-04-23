var self,
    first = true;

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
    isComponentPropertyType: function (type) {
        var result = false;
        this.site.Components.forEach(function (component, i, array) {
            if (component.Name === type)
                result = true;
        });

        return result;
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

                self.$.header.hidden = false;
                self.$.add.hidden = false;

                if (self.site.Pages !== null && self.site.Pages.length > 0) {
                    var selector = document.querySelector("core-selector");

                    for (var a = 0; a < self.site.Pages.length; a++) {
                        var page = self.site.Pages[a],
                            elPage = document.createElement("el-page"),
                            oldElPages = selector.querySelectorAll("el-page");

                        for (var b = 0; b < oldElPages.length; b++) {
                            Polymer.dom(selector).removeChild(oldElPages[b]);
                        }

                        elPage.name = page.Name;
                        elPage.visible = page.Visible;
                        elPage.components = page.Components;

                        Polymer.dom(selector).appendChild(elPage);
                    }

                    self.$.nav.hidden = false;

                    if (self.lastView !== undefined)
                        self.selectedView = self.lastView;
                    else
                        self.selectedView = self.site.Pages[0].Name;
                }
                else
                    self.selectedView = "viewAdd-Page";
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
    togglePageVisibility: function (event) {
        var xhrVisibility = document.createElement("core-request"),
            fd = new FormData();

        for (var i = 0; i < this.site.Pages.length; i++) {
            var page = this.site.Pages[i];

            if (page.Name === this.selectedView)
                fd.append("id", page.Id);
        }

        xhrVisibility.send({
            url: "/admin/togglepagevisibility",
            method: "POST",
            body: fd
        });

        xhrVisibility.completes.then(function (response) {
            if (response === "true")
                self.ready();
        }).catch(function (why) {
            console.error(why);
        })
    },
    selectPage: function (event) {
        this.selectedView = event.target.innerHTML;
    },
    deleteComponent: function (event) {
        var xhrDeleteComponent = document.createElement("core-request"),
            fd = new FormData(),
            id = event.path[(event.path.length - 10)].getAttribute("data-id");

        fd.append("id", id);

        xhrDeleteComponent.send({
            url: "/admin/deletecomponent",
            method: "POST",
            body: fd
        });

        xhrDeleteComponent.completes.then(function (response) {
            if (response === "true")
                self.ready();
        }).catch(function (why) {
            console.error(why);
        });
    },
    toggleAdd: function (event) {
        if (!this.$.options.hidden)
            this.$.options.hidden = true;
        else
            this.$.options.hidden = false;
    },
    showAddPage: function (event) {
        this.selectedView = "viewAdd-Page";
    },
    showSelectComponent: function (event) {
        var select = Polymer.dom(this.$.viewSelectComponent).querySelector("select");

        select.innerHTML = '';
        for (var i = 0; i < this.site.Components.length; i++) {
            var component = this.site.Components[i];

            select.innerHTML += "<option value='" + component.Name + "'>" + component.Name + "</options>";
        }

        this.selectedView = "viewSelect-Component";
    },
    showAddComponent: function (event) {
        var select = Polymer.dom(this.$.viewSelectComponent).querySelector("select"),
            selected = this.site.Components[select.selectedIndex],
            component = document.createElement("el-component");

        component._Id = selected.Id;
        component.Name = selected.Name;
        component.Properties = selected.Properties;

        this.$.viewComponent.innerHTML = '';
        Polymer.dom(this.$.viewComponent).appendChild(component);

        window.setTimeout(function () {
            self.selectedView = "viewComponent";
        });
    },
    showEditComponent: function (event) {
        if (first) {
            var e = event;
            first = false;
            window.setTimeout(function () {
                if (!first) {
                    if (e.target.tagName === "CORE-ICON")
                        self.deleteComponent(e);

                    first = true;
                }
            }, 750);
        }
        else {
            var elComponent = document.createElement("el-component"),
                componentId = event.path[(event.path.length - 10)].getAttribute("data-id"),
                page,
                component;

            for (var i = 0; i < this.site.Pages.length; i++) {
                var p = this.site.Pages[i];

                if (p.Name == this.selectedView || this.lastView) {
                    page = p;
                    break;
                }
            }

            for (var i = 0; i < page.Components.length; i++) {
                var c = page.Components[i];

                if (componentId == c.Id) {
                    component = c;
                    break;
                }
            }

            elComponent._Id = component.Id;
            elComponent.Name = component.Name;
            elComponent.Properties = component.Properties;

            this.$.viewComponent.innerHTML = '';
            Polymer.dom(this.$.viewComponent).appendChild(elComponent);

            window.setTimeout(function () {
                self.selectedView = "viewComponent";
            });

            first = true;
        }
    }
});