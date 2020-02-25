(function (app, undefined) {
    "use strict";

    var c = {},
        store = "cookies";

    function preparedStore() {
        var obj;
        try {
            obj = JSON.parse(localStorage[store]);
        } catch (ex) {
            obj = null;
        }

        return !obj || !_.isObject(obj) || _.isArray(obj) ? {} : obj;
    }

    var parse = _.throttle(function () {
        // Remove expired keys
        var storage = preparedStore(),
            pared = 0;

        pared = _.chain(storage)
            .filter(function (item) {
                return !moment().isBefore(item.Expires);
            })
            .each(function (item, key) {
                pared++;
                delete storage[key];
            });

        // If any items expired, save
        if (pared) {
            localStorage[store] = JSON.stringify(storage);
        }

        return _.reduce(storage, function (memo, cookie, key) {
            memo[key] = cookie.Value;
            return memo;
        }, {});
    }, 500);

    c.KeyExists = function (key) {
        return _.has(parse(), key);
    };

    c.Delete = function (key) {
        if (!c.KeyExists(key)) {
            return;
        }

        var storage = preparedStore();
        delete storage[key];
        localStorage[store] = JSON.stringify(storage);
    };

    c.Get = function (key) {
        if (!c.KeyExists(key)) {
            throw "Key not set: " + key;
        }

        var cookies = parse();
        return cookies[key];
    };

    c.Set = function (key, value, expires, path) {
        var obj = preparedStore();

        obj[key] = {
            Value: value,
            Expires: expires,
            Path: path
        };
        localStorage[store] = JSON.stringify(obj);
        return true;
    };

    // Exports
    app = app || {};
    app.LocalStorage = c;
    window.App = app;
})(window.App);