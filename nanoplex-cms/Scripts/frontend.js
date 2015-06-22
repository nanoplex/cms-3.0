var View = (function () {
    function View(Pages) {
        this.Pages = Pages;
        var that = this;
        this.View = this.getHash();
        addEventListener("hashchange", function () {
            that.changeView(that.getHash());
        });
        this.changeView(this.View);
    }
    View.prototype.getHash = function () {
        return window.location.hash.replace(/^#\//, "");
    };
    View.prototype.changeView = function (newView) {
        var content = document.querySelector("#content");
        this.View = newView;
        content.innerHTML = "<paper-spinner active></paper-spinner>";
        request("/page/get/" + this.View).text(function (page) {
            content.innerHTML = page;
        });
    };
    return View;
})();
new View([]);
//# sourceMappingURL=frontend.js.map