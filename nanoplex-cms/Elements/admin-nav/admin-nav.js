Polymer({
    is: "admin-nav",
    properties: {
        pages: Array,
        selectedPage: {
            type: "string",
            observer: "updateSelectedPage"
        },
        editMode: {
            type: Boolean,
            value: false
        }
    },
    updateSelectedPage: function (newVal) {
        var that = this;

        setTimeout(function () {
            var pages = that.querySelectorAll(".page");

            for (var i = 0, length = that.pages.length; i < length; i++) {
                if (that.pages[i].Name === newVal) {
                    pages[i].classList.add("selected");
                } else {
                    pages[i].classList.remove("selected");
                }
            }
        });

    },
    updatePageName: function (event) {
        var input = event.target,
            paperInput = input.parentNode.parentNode.parentNode,
            pageEl = paperInput.parentNode.parentNode,
            i = parseInt(pageEl.attributes["index"].value),
            page = this.pages[i],
            value = input.value,
            send = {
                name: page.Name,
                value: value
            };

        this.validatePageName(event);

        if (!input.invalid) {
            request("/page/newName").send(JSON.stringify(send)).then(function () {
                paperInput.previousElementSibling.innerHTML = value;

                if (pageEl.classList.contains("selected")) {
                    window.location.hash = "#/page/" + value;
                }
            });
        }

    },
    deletePage: function (event) {
        var that = this,
            pageEl = this.getButtonElement(event.target).parentNode,
            i, page;

        i = parseInt(pageEl.attributes["index"].value);
        page = this.pages[i];

        request("/page/delete/" + page.Name).send().then(function () {
            pageEl.hidden = true;
        });
    },
    getButtonElement: function (element) {
        var el = event.target;

        return (el.nodeName === "IRON-ICON")
            ? el.parentNode
            : el
    },
    toggleEditmode: function (event) {
        this.editMode = !this.editMode;
    },
    openAddPage: function () {
        this.querySelector("#addPage").hidden = false;
    },
    closeAddPage: function () {
        this.querySelector("#addPage").hidden = true;
    },
    addPage: function () {
        var that = this,
            addPage = this.querySelector("#addPage"),
            input = addPage.querySelector("paper-input"),
            value = input.value,
            valid = !input.invalid;

        if (valid) {
            request("/page/add/" + value).send().then(function () {
                that.fire("pages-changed");
                that.closeAddPage();
            });
        }
    },
    validatePageName: function (event) {
        var input = event.target,
            value = input.value;

        if (value === "") {
            input.invalid = true;
            return;
        }

        for (var i = 0, length = this.pages.length; i < length; i++) {
            if (this.pages[i].Name === value) {
                input.invalid = true;
                return true;
            }
        }

        input.invalid = false;
        return false;
    },
    changePage: function (event) {
        var name = event.target.innerHTML;
        window.location.hash = "/page/" + name;
    }
});