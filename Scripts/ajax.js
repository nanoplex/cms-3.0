var request,
    xhr;

(function () {
    "use strict";

    xhr = function (method, url, data) {
        return new Promise(function (resolve, reject) {
            var request = new XMLHttpRequest();

            request.open(method, url, true);
            request.onload = resolve;
            request.onerror = reject;
            request.setRequestHeader("Content-Type", "application/json");
            request.send(data);
        });
    };

    request = function (url) {
        try {
            Object.defineProperty(request, 'url', {
                writable: true,
                value: url
            });
        } catch (ex) {
            request.url = url;
        }
        

        return request;
    };

    request.json = function (callback) {
        xhr("GET", request.url).then(function (response) {
            callback(JSON.parse(response.target.response));
        }).catch(console.warn);
    };

    request.text = function (callback) {
        xhr("GET", request.url).then(function (response) {
            callback(response.target.response);
        }).catch(console.warn);
    };

    request.send = function (data) {
        return new Promise(function (resolve, reject) {
            xhr("POST", request.url, data).then(resolve).catch(reject);
        });
        
    };

})();