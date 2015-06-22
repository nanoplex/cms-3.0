Polymer({
    is: "el-admin",
    properties: {
        pages: {
            type: Array,
            observer: "pagesChanged"
        },
        componentTypes: Array,
        selectedPage: Object
    },
    attached: function () {
        var that = this;

        this.getPages(function () {
            that.selectedPage = that.getSelectedPage(that.pages);
        });

        this.getCompoentTypes();

        this.querySelector("admin-nav").addEventListener("pages-changed", function () {
            that.getPages(function () {
                that.selectedPage = that.getSelectedPage(that.pages);
            });
        });
        this.querySelector("admin-components").addEventListener("pages-changed", function () {
            that.getPages(function () {
                var components = that.getSelectedPage(that.pages).Components;

                that.set("selectedPage.Components", components);
            });
        });

        addEventListener("hashchange", function () {
            var hash = window.location.hash,
                location = hash.match(/(?!#\/)\w+/),
                components = that.querySelector("admin-components"),
                oldView = that.querySelector("component-view");

            if (location) {
                location = location[0];
            }

            components.hidden = true;
            if (oldView) oldView.parentNode.removeChild(oldView);

            if (location === "page") {
                that.selectedPage = that.getSelectedPage(that.pages);

                components.hidden = false;
            } else if (location === "component" && that.selectedPage) {
                var newView = document.createElement("component-view"),
                    i = parseInt(hash.match(/\w+$/)[0]),
                    component = that.selectedPage.Components[i];
                    
                newView.className = "layout vertical center flex style-scope el-admin";
                newView.pageName = that.selectedPage.Name;
                newView.name = component.Name;
                newView.properties = component.Properties

                that.$.content.appendChild(newView);
            }
        });
    },
    pagesChanged: function (newVal) {
        var hash = window.location.hash;

        if (hash.match(/(?!#\/)page\//) === null && newVal.length > 0) {
            window.location.hash = "#/page/" + newVal[0].Name;
        }
    },
    getPages: function (callback) {
        var that = this,
            selectedPage = this.selectedPage;

        request("/page/all").json(function (pages) {
            that.pages = pages;

            if (typeof callback === "function") {
                callback();
            }
        });
    },
    getCompoentTypes: function () {
        var that = this;

        request("/component/types").json(function (types) {
            that.componentTypes = types;
        });
    },
    getSelectedPage: function (pages) {
        var pageName = window.location.hash.replace(/#\/page\//, ""),
            page;

        for (var i = 0, len = pages.length; i < len; i++) {
            page = pages[i];
            if (page.Name === pageName) {
                return page;
            }
        }
    },
    setSelectedPage: function (index) {
        this.selctedPage = this.pages[index];
    }
});