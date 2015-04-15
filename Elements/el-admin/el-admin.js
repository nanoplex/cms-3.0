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
                    if (self.lastView !== undefined)
                        self.selectedView = self.lastView;
                    else
                        self.selectedView = self.site.Pages[0].Name;

                    window.setTimeout(function () {
                        var pages = document.querySelectorAll("core-selector article.page");

                        for (var a = 0; a < pages.length; a++) {
                            var page = self.site.Pages[a],
                                icon = Polymer.dom(pages[a]).querySelector("section:first-child button core-icon"),
                                components = Polymer.dom(pages[a]).querySelector(".components");

                            if (page.Visible)
                                icon.setAttribute("icon", "visibility");
                            else
                                icon.setAttribute("icon", "visibility-off")

                            components.innerHTML = '';

                            for (var b = 0; b < page.Components.length; b++) {
                                var component = page.Components[b],
                                    viewComponent = document.createElement("article"),
                                    headerSection = document.createElement("section"),
                                    header = document.createElement("h3"),
                                    button = document.createElement("button"),
                                    icon = document.createElement("core-icon");

                                self.listen(viewComponent, "tap", "showEditComponent");
                                viewComponent.setAttribute("tabindex", "0");
                                viewComponent.setAttribute("data-id", component.Id);
                                viewComponent.classList.add("component");
                                viewComponent.classList.add("style-scope");
                                viewComponent.classList.add("el-admin");

                                headerSection.classList.add("layout");
                                headerSection.classList.add("horizontal");
                                headerSection.classList.add("center");
                                headerSection.classList.add("style-scope");
                                headerSection.classList.add("el-admin");

                                header.innerHTML = component.Name;
                                header.classList.add("flex");
                                header.classList.add("style-scope");
                                header.classList.add("el-admin");

                                icon.setAttribute("icon", "close");
                                icon.classList.add("style-scope");
                                icon.classList.add("el-admin");

                                self.listen(button, "tap", "deleteComponent");
                                button.classList.add("style-scope");
                                button.classList.add("el-admin");

                                Polymer.dom(button).appendChild(icon);

                                Polymer.dom(headerSection).appendChild(header)
                                Polymer.dom(headerSection).appendChild(button);

                                Polymer.dom(viewComponent).appendChild(headerSection);

                                for (var c = 0; c < component.Properties.length; c++) {
                                    var prop = component.Properties[c],
                                        propertySection = document.createElement("section"),
                                        name = document.createElement("b"),
                                        value = document.createElement("p");

                                    propertySection.classList.add("property");
                                    propertySection.classList.add("layout");
                                    propertySection.classList.add("horizontal");
                                    propertySection.classList.add("center");
                                    propertySection.classList.add("style-scope");
                                    propertySection.classList.add("el-admin");

                                    name.innerHTML = prop.Name;
                                    name.classList.add("flex");
                                    name.classList.add("style-scope");
                                    name.classList.add("el-admin");

                                    value.innerHTML = prop.Value;
                                    value.classList.add("style-scope");
                                    value.classList.add("el-admin");

                                    Polymer.dom(propertySection).appendChild(name);
                                    Polymer.dom(propertySection).appendChild(value);

                                    Polymer.dom(viewComponent).appendChild(propertySection);
                                }

                                Polymer.dom(components).appendChild(viewComponent);
                            }
                        }
                    })
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
            id = event.path[(event.path.length - 9)].getAttribute("data-id");

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
        if (first)
            first = false;
        else {
            var elComponent = document.createElement("el-component"),
                componentId = event.path[(event.path.length - 9)].getAttribute("data-id"),
                page,
                component;

            for (var i = 0; i < this.site.Pages.length; i++) {
                var p = this.site.Pages[i];

                if (p.Name == this.selectedView) {
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
})