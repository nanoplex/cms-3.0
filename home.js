(function () {
    var site,
        projectName,
        title = document.querySelector("title"),
        header = document.querySelector("h1"),
        nav = document.querySelector("ul"),
        views = document.querySelector("section");

    function getBrowser() {
        var ua = navigator.userAgent, tem,
        M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
        if (/trident/i.test(M[1])) {
            tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
            return 'IE ' + (tem[1] || '');
        }
        if (M[1] === 'Chrome') {
            tem = ua.match(/\b(OPR|Edge)\/(\d+)/);
            if (tem != null) return tem.slice(1).join(' ').replace('OPR', 'Opera');
        }
        M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
        if ((tem = ua.match(/version\/(\d+)/i)) != null) M.splice(1, 1, tem[1]);
        return M.join(' ');
    }

    function getLocationData() {
        return new Promise(function (resolve, reject) {
            var xhr = document.createElement("core-request");

            xhr.send({
                url: "http://freegeoip.net/json/",
                handleAs: "json"
            });

            xhr.completes.then(resolve).catch(reject);
        });
    }

    function finishView(viewId) {
        return new Promise(function (resolve, reject) {
            var xhr = document.createElement("core-request"),
                        formData = new FormData();

            formData.append("endTime", Date.now());
            formData.append("viewId", viewId);

            xhr.send({
                url: "/home/finishView",
                method: "POST",
                body: formData
            });

            xhr.completes.then(resolve).catch(reject);
        });
    }

    function newView(locationData, pageId) {
        return new Promise(function (resolve, reject) {
            var xhr = document.createElement("core-request"),
                formData = new FormData();

            formData.append("startTime", Date.now());
            formData.append("browser", getBrowser());
            formData.append("os", navigator.platform);
            formData.append("ip", locationData.ip);
            formData.append("language", navigator.language);
            formData.append("country", locationData.country_name);
            formData.append("city", locationData.city);
            formData.append("longitude", locationData.longitude);
            formData.append("latitude", locationData.latitude);
            formData.append("pageFk", pageId);

            xhr.send({
                url: "/home/addView",
                method: "POST",
                body: formData
            });

            xhr.completes.then(resolve).catch(reject);
        });
    }

    function addView(pageId, lastView) {
        getLocationData().then(function (locationData) {
            newView(locationData, pageId).then(updatePages);
        }).catch(function (why) {
            console.error(why);
        });
    }

    function changeView() {
        var state = window.location.hash.replace(/^#\//, ''),
            views = document.querySelectorAll("section > article"),
            missingView = document.getElementById("missing"),
            selectedView = document.getElementById(state),
            page;

        for (var i = 0; i < site.Pages.length; i++) {
            var p = site.Pages[i];

            if (p.Name = state) {
                page = p;
                break;
            }
        }

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


        addView(page.Id, page.Views[(page.Views.length - 1)]);
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

        views.innerHTML += "<article id='" + page.Name + "' hidden>" +
            "<h2>" + page.Name + "</h2>" +
        "</article>";

        initComponents(page.Components, document.getElementById(page.Name));
    }

    function initSite() {
        getSite().then(function () {
            projectName = site.ProjectName;

            title.innerHTML = projectName;
            header.innerHTML = projectName;

            site.Pages.forEach(initPage);

            window.addEventListener("hashchange", changeView);

            if (window.location.hash)
                changeView();
            else
                window.location.hash = "#/" + site.Pages[0].Name

        }).catch(function (why) {
            console.error(why);
        });
    }

    function getSite() {
        return new Promise(function (resolve, reject) {
            var xhr = document.createElement("core-request");

            xhr.send({
                url: "/home/getSite",
                handleAs: "json"
            });

            xhr.completes.then(function (response) {
                site = response;

                console.log("site", site);

                resolve();
            }).catch(reject);
        });
    }

    function updatePages() {
        return new Promise(function (resolve, reject) {
            var xhr = document.createElement("core-request");

            xhr.send({
                url: "/home/getNewPages",
                handleAs: "json"
            });

            xhr.completes.then(function (response) {
                site = response;

                console.log("site", site);

                resolve();
            }).catch(reject);
        });
    }
    initSite();
})();