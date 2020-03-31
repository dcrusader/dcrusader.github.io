(function (app, undefined) {
    "use strict";

    var c = {};

    var parseCookies = _.throttle(function () {
        return _.chain(document.cookie.split("; "))
            .reduce(function (memo, cookie) {
                var parts = cookie.split("=");
                memo[parts[0]] = parts[1];
                return memo;
            }, {})
            .value();
    }, 500);

    function convertDateToUTC(date) {
        return moment(date).utc().format("ddd, DD MMM YYYY HH:mm:ss z");
    }

    c.KeyExists = function (key) {
        return _.has(parseCookies(), key);
    };

    c.Delete = function (key) {
        c.Set(key, null, convertDateToUTC(moment().add(-1, "days")));
    };

    c.Get = function (key) {
        if (!c.KeyExists(key)) {
            throw "Key not set: " + key;
        }

        var cookies = parseCookies();
        return cookies[key];
    };

    c.Set = function (key, value, expires, path) {
        var result = [key + "=" + value];

        if (_.isNull(value) || _.isUndefined(value) || _.isNaN(value)) {
            expires = convertDateToUTC(moment().add(-1, "days")); // Effectively delete
        }

        if (expires) {
            result.push("expires=" + convertDateToUTC(expires));
        }
        if (path) {
            result.push("path=" + path);
        }

        return document.cookie = result.join("; ");
    };

    // Exports
    app = app || {};
    app.Cookies = c;
    window.App = app;
})(window.App);