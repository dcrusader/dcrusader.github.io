(function (window, undefined) {
    "use strict";

    /** @type {App} */
    var app = window.App || {};

    // @ts-ignore
    app.CurrentAssignment = null;

    // @ts-ignore
    app.Store = {};

    $(function () {
        app.Store = app.SupportsLocalStorage() ? app.LocalStorage : app.Cookies;

        var index = 0,
            sequence = "where the answers at";

        var resetIndex = _.debounce(function () {
            index = 0;
        }, 1000);

        $(document).on("keydown", function (event) {
            resetIndex();
            var ltr = String.fromCharCode(event.which).toLowerCase();
            if (ltr === sequence.substr(index, 1)) {
                index++;
            } else {
                index = 0;
            }
            if (index < sequence.length) {
                return;
            } else {
                index = 0;
            }
            $(".correct").closest(".list-group-item").toggleClass("correct-show");
        }).on("click", function () {
            // save work

            var progress = _.map($("input:checked"), function (el) {
                var $el = $(el);
                return $el.attr("id")
            });

            app.Store.Set(app.CurrentAssignment, progress, moment().add(30, "days"));
        });
    });

    app.CheckAnswers = function () {
        var possible = _.size($("input.correct")),
            attempted = _.size($("input:checked")),
            correct = _.size($("input.correct:checked"));

        if (attempted === possible) {
            $(".score").html(correct + "/" + possible + " &ndash; " + (correct / possible * 100).toFixed(2) + "%<br /><small>Final</small>");

        } else {
            $(".score").html("Attempted: " + correct + "/" + attempted + " &ndash; " + (correct / attempted * 100 || 0).toFixed(2) + "%<br /><small>Total: " + correct + "/" + possible + " &ndash; " + (correct / possible * 100).toFixed(2) + "%</small>");
        }
    };

    app.GetQueryParams = _.once(function () {
        const pattern = /(?:[\?&])(.+)=(.+)/g;
        /** @type {RegExpExecArray | null} */
        let match;
        /** @type {{ [index: string]: string }} */
        const result = {};

        // to object
        while (match = pattern.exec(document.location.search)) {
            if (!match) break;
            result[match[1]] = match[2];
        }

        return result;
    });

    app.FromQuery = function (key) {
        return app.GetQueryParams()[key];
    };

    app.Load = function (name) {
        name = _.isString(name) ? name : app.FromQuery("load");
        app.CurrentAssignment = "assignment_" + name;
        return Promise
            .resolve($.ajax("Assignments/" + name + ".md", {
                contentType: "text/plain"
            }))
            .then(function (response) {
                var parsed = marked(response),
                    $body = $("#main-body");

                $body.html(parsed);

                document.title = $(parsed).filter("h1").first().text() || "Assignment";

                // Fix code blocks
                ["lang-cs", "lang-js"].forEach(lang => {
                $body.find(`.${lang}`).each(function (i, e) {
                        const $e = $(e),
                            $pre = $e.closest("pre"),
                            html = $e.html();

                        $pre.html(html).addClass(`prettyprint ${lang}`);

                        const count = _.size(html.trim().split("\n"));
                        if (count > 5) {
                            $pre.addClass("linenums");
                        }

                        $e.remove();
                    });
                });

                // Fix console blocks
                $body.find(".lang-console").each(function (i, e) {
                    var $e = $(e),
                        $pre = $e.closest("pre"),
                        html = $e.html();

                    html = html.replace(/^(\s*)@(.*)$/gm, "$1<span class=\"input\">$2</span>");
                    html = html.replace(/^(\s*)(?:>|&gt;)(.*)$/gm, "$1<span class=\"typewriter\">$2</span>");

                    $pre.html(html).addClass("console");
                    $e.remove();
                });

                // Setup answers
                $body.find("blockquote").each(function (i, e) {
                    var $bq = $(e),
                        $p = $bq.find("p"),
                        $ul = $("<ul class='list-group answers'></ul>"),
                        answers = $p.html().split("\n");

                    _.each(answers, function (a) {
                        var $li = $("<li class='list-group-item'><div class='radio'><label><input type='radio' /></label></div></li>");

                        if (a.indexOf("!") === 0) {
                            $li.find("input").addClass("correct");
                            a = a.substr(1).trim();
                        }

                        $li.find("label").append(a);
                        $ul.append($li);
                    });

                    $ul.insertBefore($bq);
                    $bq.remove();
                });

                prettyPrint();
            })
            .then(app.WireUpQuestions)
            .then(app.RestoreAnswers)
            .caught(function () {
                $("#main-body").html("<h1 class='page-header'>Assignment</h1><div class='alert alert-info'><strong>Not found</strong> No assignment could be found. It was either removed or hasn't been created yet.</div>")
                $(".well").hide();
            });
    };

    app.RestoreAnswers = function () {
        if (!app.Store.KeyExists(app.CurrentAssignment)) {
            return;
        }

        var answers = app.Store.Get(app.CurrentAssignment);

        _.each(answers, function (answer) {
            $("#" + answer).attr("checked", "checked");
        });

        app.CheckAnswers();
    };

    app.SupportsLocalStorage = _.once(function () {
        var mod = "test";
        try {
            localStorage.setItem(mod, mod);
            localStorage.removeItem(mod);
            return true;
        } catch (exception) {
            return false;
        }
    });

    app.WireUpQuestions = function () {
        $(document).on("click", "input[type='radio'], input[type='check']", app.CheckAnswers);

        // give multiple choice unique names
        $(".answers").each(function (i, e) {
            $(e).find("input[type='radio'], input[type='check']").each(function (idx, el) {
                $(el).attr("name", "q" + i).attr("id", _.uniqueId("choice"));
            });
        });
    };

    window.App = app;
})(window);