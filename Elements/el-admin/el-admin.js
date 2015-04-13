var self;

Polymer({
    is: "el-admin",
    properties: {
        site: {
            type: Object,
            value: undefined,
            notify: true
        }
    },
    hostAttributes: {
        'class': "layout vertical fit"
    },
    ready: function () {
        self = this;

        var xhrAuth = document.createElement("core-request");

        this.changeView("viewLoading");

        xhrAuth.send({
            url: "/admin/auth"
        });

        xhrAuth.completes.then(function (response) {
            if (response === "new") {
                self.changeView("viewInstall");
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
    changeView: function (view) {
        var views = Polymer.dom(this.$.views).querySelectorAll("article[id]"),
            title = document.querySelector("title");

        console.log("view", view);

        title.innerHTML = view.replace(/^view/, '').replace(/^page/, '');

        for (var i = 0; i < views.length; i++) {
            views[i].setAttribute("hidden", "");

            if (views[i].getAttribute("id") === view)
                views[i].removeAttribute("hidden");
        }
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

            xhrInit.send({
                url: "/admin/InitProject",
                method: "POST",
                body: fd
            });
        }

        xhrInit.completes.then(function (response) {
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

                self.site = response;

                self.$.header.removeAttribute("hidden");

                if (self.site.Pages !== null && self.site.Pages.length > 0) {
                    self.$.nav.removeAttribute("hidden");

                    self.changeView("page" + self.site.Pages[0].Name);
                }
                else
                    self.changeView("viewAddPage");
            }
            else
                console.error(response);
        }).catch(function (why) {
            console.error(why);
        })
    },
    addPage: function (event) {
        var xhrPage = document.createElement("core-request"),
            fd = new FormData(),
            name = Polymer.dom(this.$.viewAddPage).querySelector("input[name=name]"),
            pages = this.site.Pages;

        fd.append("name", name.value);

        if (pages !== null && pages.length > 0)
            fd.append("order", pages[pages.length].Order);
        else
            fd.append("order", 0);

        if (this.validateInputs([name])) {
            xhrPage.send({
                url: "/admin/addPage",
                body: fd,
                method: "POST"
            });
        }

        xhrPage.completes.then(function (response) {
            if (response === "true")
                self.ready();
            else if (response === "false")
                /*page exists*/;
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
    showAdd: function (event) {
        if (this.$.options.getAttribute("hidden") == null)
            this.$.options.setAttribute("hidden", "");
        else
            this.$.options.removeAttribute("hidden");
    },
    showAddPage: function (event) {
        this.changeView("viewAddPage");
    }
})