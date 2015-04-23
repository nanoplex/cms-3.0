(function () {
    var xhr = document.createElement("core-request"),
            projectName,
            title = document.querySelector("title"),
            header = document.querySelector("h1"),
            nav = document.querySelector("ul"),
            views = document.querySelector("section");

    function changeView() {
        var state = window.location.hash.replace(/^#\//, ''),
            views = document.querySelectorAll("section > article"),
            missingView = document.getElementById("missing"),
            selectedView = document.getElementById(state);

        for (var i = 0; i < views.length; i++) {
            views[i].hidden = true;
        }

        if (selectedView !== null)
            selectedView.hidden = false;
        else if (!window.location.hash)
            views[2].hidden = false;
        else
            missing.hidden = false;

        title.innerHTML = projectName + " - " + state;
    }

    function bindFrontendText(component) {
        var text = component.Frontend;

        component.Properties.forEach(function (property, i, a) {
            text = text.replace(new RegExp("{{" + property.Name + "}}", "gi"), property.Value);
        });

        return text;
    }

    function initComponents(components, view) {
        components.forEach(function (component, i, a) {
            view.innerHTML += bindFrontendText(component) ||
                console.error("frontend text missing", component);
        });
    }

    function initPage(page, i, a) {
        nav.innerHTML += "<li><a href='#/" + page.Name + "'>" + page.Name + "</a></li>";

        document.getElementById("loading").hidden = true;

        views.innerHTML += "<article id='" + page.Name + "' hidden></article>";

        initComponents(page.Components, document.getElementById(page.Name));
    }

    function initSite(site) {
        console.log("site", site);

        projectName = site.ProjectName;

        title.innerHTML = projectName;
        header.innerHTML = projectName;

        site.Pages.forEach(initPage);

        window.addEventListener("hashchange", changeView);

        if (window.location.hash)
            changeView();
        else
            document.querySelector("section article:nth-child(3)").hidden = false;
    }

    xhr.send({
        url: "/home/getSite",
        handleAs: "json"
    });

    xhr.completes.then(initSite);
})()