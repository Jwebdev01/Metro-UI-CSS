/* global Metro */
(function(Metro, $) {
    'use strict';
    var Utils = Metro.utils;
    var CounterDefaultConfig = {
        startOnViewport: true,
        counterDeferred: 0,
        duration: 2000,
        value: 0,
        timeout: 0,
        delimiter: ",",
        onStart: Metro.noop,
        onStop: Metro.noop,
        onTick: Metro.noop,
        onCounterCreate: Metro.noop
    };

    Metro.counterSetup = function (options) {
        CounterDefaultConfig = $.extend({}, CounterDefaultConfig, options);
    };

    if (typeof window["metroCounterSetup"] !== undefined) {
        Metro.counterSetup(window["metroCounterSetup"]);
    }

    Metro.Component('counter', {
        init: function( options, elem ) {
            this._super(elem, options, CounterDefaultConfig, {
                numbers: [],
                html: $(elem).html(),
                started: false,
                id: Utils.elementId("counter")
            });

            return this;
        },

        _create: function(){
            var that = this, element = this.element, o = this.options;

            this._fireEvent("counter-create", {
                element: element
            });

            if (o.startOnViewport !== true) {
                this.start();
            }

            if (o.startOnViewport === true) {
                if (Utils.inViewport(element[0]) && !this.started) {
                    this.start();
                }

                $.window().on("scroll", function(){
                    if (Utils.inViewport(element[0]) && !that.started) {
                        that.start();
                    }
                }, {ns: this.id})
            }
        },

        start: function(){
            var that = this, element = this.element, o = this.options;

            this.started = true;

            Utils.exec(o.onStart, null, element[0]);
            element.fire("start");

            element.animate({
                draw: {
                    innerHTML: [0, +o.value]
                },
                defer: o.timeout,
                dur: o.duration,
                onFrame: function () {
                    Utils.exec(o.onTick, [+this.innerHTML], element[0]);
                    element.fire("tick", {
                        value: +this.innerHTML
                    });
                    this.innerHTML = Number(this.innerHTML).format(0, 0, o.delimiter)
                },
                onDone: function(){
                    that.started = false;
                    Utils.exec(o.onStop, null, element[0]);
                    element.fire("stop");
                }
            })
        },

        reset: function(){
            this.started = false;
            this.element.html(this.html);
        },

        changeAttribute: function(attributeName, newVal){
            if (attributeName === "data-value") {
                this.options.value = +newVal;
            }
        },

        destroy: function(){
            if (this.options.startOnViewport === true) {
                $.window().off("scroll", {ns: this.id});
            }
            return this.element;
        }
    });
}(Metro, m4q));