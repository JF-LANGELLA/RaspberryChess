/*chess counter*/

(function () {
    // format duration as string
    var displayTime, getTimeString, resetButtonClasses, toggleButtons;

    getTimeString = function (time) {
        var secs;
        secs = time.get('seconds');
        if (secs < 10) {
            secs = `0${secs}`;
        }
        return `${time.get('minutes')}:${secs}`;
    };


    // toggle classes and disabled props of buttons
    toggleButtons = function (elem) {
        if (elem === "right-counter") {
            // props
            $("#left-counter .toggle").prop("disabled", false);
            $("#right-counter .toggle").prop("disabled", true);

            // classes
            $("#right-counter .toggle").addClass("btn-default btn-disabled");
            $("#right-counter .toggle").removeClass("btn-primary");
            return $("#left-counter .toggle").addClass("btn-primary");
        } else if (elem === "left-counter") {
            // props
            $("#left-counter .toggle").prop("disabled", true);
            $("#right-counter .toggle").prop("disabled", false);

            // classes
            $("#left-counter .toggle").addClass("btn-default btn-disabled");
            $("#left-counter .toggle").removeClass("btn-primary");
            return $("#right-counter .toggle").addClass("btn-primary");
        }
    };


    // restores both toggles to original state
    resetButtonClasses = function () {
        $("#left-counter input").addClass("btn-primary");
        $("#left-counter input").removeClass("btn-default btn-disabled");
        $("#right-counter input").addClass("btn-primary");
        return $("#right-counter input").removeClass("btn-default btn-disabled");
    };


    // change the time shown on page
    displayTime = function (elem, time) {
        return $(elem).html(getTimeString(time));
    };


    // doc ready
    jQuery(function ($) {
        var leftTimer, resetAll, rightTimer, t1, t2;
        // init timers
        t1 = moment.duration(30, "minutes");
        t2 = moment.duration(30, "minutes");
        displayTime("#left-counter .time", t1);
        displayTime("#right-counter .time", t2);

        // set right timer
        rightTimer = $('#right-counter .toggle').on('click', function () {

            // pause other timer
            if (leftTimer) {
                clearInterval(leftTimer);
                toggleButtons("right-counter");
            }
            return rightTimer = setInterval(function () {
                if (t2.as('seconds') > 0) {
                    t2.subtract(moment.duration(1, 's'));
                    return displayTime("#right-counter .time", t2);
                } else {
                    return clearInterval(self);
                }
            }, 1000);
        });

        // set left timer
        leftTimer = $('#left-counter .toggle').on('click', function () {
            if (rightTimer) {
                clearInterval(rightTimer);
                toggleButtons("left-counter");
            }
            return leftTimer = setInterval(function () {
                if (t1.as('seconds') > 0) {
                    t1.subtract(moment.duration(1, 's'));
                    return displayTime("#left-counter .time", t1);
                } else {
                    return clearInterval(self);
                }
            }, 1000);
        });

        // pause timer for active player
        $("#pause").on('click', function () {
            if ($("#left-counter .toggle").prop === "disabled") {
                toggleButtons("left-counter");
            } else {
                toggleButtons("right-counter");
            }
            clearInterval(leftTimer);
            return clearInterval(rightTimer);
        });

        // reset both timers and toggles
        $("#reset").on('click', function () {
            $('#time-input').val(30);
            return resetAll(30);
        });
        $('#time-input').on('change', function () {
            return resetAll(parseInt($('#time-input').val()));
        });
        return resetAll = function (minutes) {
            clearInterval(leftTimer);
            clearInterval(rightTimer);
            t1 = moment.duration(minutes, "minutes");
            t2 = moment.duration(minutes, "minutes");
            displayTime("#left-counter .time", t1);
            displayTime("#right-counter .time", t2);

            // reset disabled property
            $("#left-counter input").prop("disabled", false);
            $("#right-counter input").prop("disabled", false);

            // reset button classes
            return resetButtonClasses();
        };
    });

}).call(this);

//# sourceURL=coffeescript