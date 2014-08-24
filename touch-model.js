var State = require('ampersand-state');
var _ = require('underscore');
var console = window.console;


module.exports = State.extend({
    log: function () {
        var id = Number((this.id + '').slice(-2));
        var args = _.toArray(arguments);
        args.unshift(id);
        console.log.apply(console, args);
    },
    processEvent: function (e, touch) {
        var self = this;
        var changes;

        if (e.type === 'touchstart') {
            if (this.phase) return;
            changes = {
                startTime: e.timeStamp,
                startX: touch.pageX,
                startY: touch.pageY,
                phase: 'start',
                target: touch.target
            };
            setTimeout(function () {
                if (self.phase !== 'end') {
                    self.timeStamp = Date.now();
                    self.log('SETTING TIME');
                }
            }, e.timeStamp - Date.now() + this.minHoldTime + 1);
        } else if (e.type === 'touchmove') {
            changes = {
                phase: 'move'
            };
        } else if (e.type === 'touchend') {
            changes = {
                endTime: e.timeStamp,
                phase: 'end',
                tossed: self.speed > 1,
                lastDirection: this.getPrimaryDirection(this.x - this.previous('x'), this.y - this.previous('y'))
            };

        }

        if (touch.pageY !== 0 && touch.pageX !== 0) {
            changes.x = touch.pageX;
            changes.y = touch.pageY;
        }

        // handle first direction if relevant
        if (this.phase === 'start' && e.type === 'touchmove') {
            changes.firstDirection = this.getPrimaryDirection(touch.pageX - this.startX, touch.pageY - this.startY);
        }

        // always set time
        changes.timeStamp = e.timeStamp;

        window.lastTouch = this;

        this.set(changes);

        if (this.customHandler) {
            this.customHandler(e, this);
            this.on('change:holding', function () {
                self.customHandler(null, self);
            });
        }

        this.log(e.type, changes.x, changes.y);
    },
    props: {
        id: 'number',
        minHoldTime: ['number', true, 300],
        maxHoldDistance: ['number', true, 10],
        maxTapTime: ['number', true, 200],
        tapMaxDistance: ['number', true, 10],
        doubleTapDistance: ['number', true, 20],
        doubleTapMaxTime: ['number', true, 300]
    },
    session: {
        startTime: 'number',
        endTime: 'number',
        startX: 'number',
        startY: 'number',
        x: 'number',
        y: 'number',
        yDelta: 'number',
        xDelta: 'number',
        phase: {
            values: ['start', 'move', 'end']
        },
        firstDirection: {
            values: ['up', 'down', 'left', 'right']
        },
        lastDirection: {
            values: ['up', 'down', 'left', 'right']
        },
        timeStamp: 'number',
        payload: 'object',
        target: 'object',
        tossed: ['boolean', true, false]
    },
    derived: {
        speed: {
            deps: ['x', 'y', 'timeStamp'],
            fn: function () {
                // distance change since last timestamp
                var dDelta = this.getDistance(this.x - this.previous('x'), this.y - this.previous('y'));
                // time change since last
                var tDelta = this.timeStamp - this.previous('timeStamp');
                return dDelta / tDelta || this.tossSpeed || 0;
            }
        },
        verticalSpeed: {
            deps: ['y', 'timeStamp'],
            fn: function () {
                var tDelta = (this.timeStamp - this.previous('timeStamp')) || 0;
                var yDelta = (this.y - this.previous('y')) || 0;
                return yDelta / tDelta;
            }
        },
        horizontalSpeed: {
            deps: ['x', 'timeStamp'],
            fn: function () {
                var tDelta = (this.timeStamp - this.previous('timeStamp')) || 0;
                var xDelta = (this.x - this.previous('x')) || 0;
                return xDelta / tDelta;
            }
        },
        firstAxis: {
            deps: ['firstDirection'],
            fn: function () {
                var first = this.firstDirection;
                if (!first) {
                    return;
                } else if (first === 'up' || first === 'down') {
                    return 'y';
                } else {
                    return 'x';
                }
            }
        },
        deltaX: {
            deps: ['startX', 'x'],
            fn: function () {
                return this.x - this.startX;
            }
        },
        deltaY: {
            deps: ['startY', 'y'],
            fn: function () {
                return this.y - this.startY;
            }
        },
        touchTime: {
            deps: ['timeStamp', 'endTime', 'startTime'],
            fn: function () {
                if (this.endTime) {
                    return this.endTime - this.startTime;
                } else {
                    return this.timeStamp - this.startTime;
                }
            }
        },
        done: {
            deps: ['phase'],
            fn: function () {
                return this.phase === 'end';
            }
        },
        holding: {
            deps: ['done', 'timeStamp', 'distance'],
            fn: function () {
                return !this.done &&
                    this.touchTime > this.minHoldTime &&
                    (this._cache.holding || this.distance < this.maxHoldDistance);
            }
        },
        distance: {
            deps: ['deltaX', 'deltaY'],
            fn: function () {
                return this.getDistance(this.deltaX, this.deltaY);
            }
        },
        tap: {
            deps: ['done'],
            fn: function () {
                return this.done && this.touchTime < this.maxTapTime && this.distance < this.tapMaxDistance;
            }
        }
    },
    getDistance: function (deltaX, deltaY) {
        return Math.round(Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2)));
    },
    getPrimaryDirection: function (deltaX, deltaY) {
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            if (deltaX < 0) {
                return 'left';
            } else {
                return 'right';
            }
        } else {
            if (deltaY < 0) {
                return 'up';
            } else {
                return 'down';
            }
        }
    }
});
