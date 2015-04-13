Polymer({
    is: "el-admin",
    properties: {
        site: {
            type: Object,
            value: undefined,
            notify: true
        }
    },
    ready: function () {
        var xhrAuth = document.createElement("core-request");

        xhrAuth.send({
            url: "/admin/auth",
            handleas: "text"
        });

        xhrAuth.completes.then(function (response) {
            console.log("auth", response);
        }).catch(function (why) {
            console.error(why);
        });
    }
})