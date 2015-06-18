declare var request;

class View {
    View: string;

    constructor(public Pages: string[]) {
        var that = this;

        this.View = this.getHash();

        addEventListener("hashchange", function () {
            that.changeView(that.getHash());
        }); 

        this.changeView(this.View);
    }

    getHash() {
        return window.location.hash.replace(/^#\//, "");
    }

    changeView(newView: string) {
        var content = document.getElementById("content");
        
        this.View = newView;

        content.innerHTML = "<paper-spinner active></paper-spinner>";

        request("/home/page/" + this.View).text(function (page) {
            content.innerHTML = page;
        });
    }
}

new View([]);