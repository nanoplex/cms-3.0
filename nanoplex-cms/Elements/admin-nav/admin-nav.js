Polymer({
    is: "admin-nav",
    properties: {
        pages: Array,
        newPageName: String,
        selectedPage: {
            type: String,
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

            console.log(newVal, that.pages, pages);

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

        request("/admin/pageName").send(JSON.stringify(send)).then(function () {
            paperInput.previousElementSibling.innerHTML = value;

            if (pageEl.classList.contains("selected")) {
                window.location.hash = "#/page/" + value;
            }
        });
    },
    deletePage: function (event) {
        var pageEl = this.getButtonElement(event.target).parentNode;
        i, page;

        i = parseInt(pageEl.attributes["index"].value);
        page = this.pages[i];

        request("/admin/pageDelete/" + page.Name).send().then(function () {
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
    }
});