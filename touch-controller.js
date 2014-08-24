var TouchesCollection = require('./touch-collection');
var _ = require('underscore');


function TouchListener(el, customHandler) {
    this.touchCollection = new TouchesCollection();
    this.el = el || document;
    this.customHandler = customHandler;

    _.bindAll(this, 'handleTouchStart', 'handleTouchMove', 'handleTouchCancel', 'handleTouchEnd');

    this.el.addEventListener('touchstart', this.handleTouchStart, false);
    this.el.addEventListener('touchcancel', this.handleTouchCancel, false);
    this.el.addEventListener('touchmove', this.handleTouchMove, false);
    this.el.addEventListener('touchend', this.handleTouchEnd, false);
    this.el.addEventListener('touchleave', this.handleTouchEnd, false);
}


TouchListener.prototype.handleTouchStart = function (e) {
    var collection = this.touchCollection;
    var customHandler = this.customHandler;
    _.each(e.touches, function (touch) {
        var model = collection.getOrCreate(touch.identifier);
        model.customHandler = customHandler;
        model.processEvent(e, touch);
    });
};

TouchListener.prototype.handleTouchMove = function (e) {
    var collection = this.touchCollection;
    _.each(e.changedTouches, function (touch) {
        var model = collection.getOrCreate(touch.identifier);
        model.processEvent(e, touch);
    });
};

TouchListener.prototype.handleTouchCancel = function (e) {
    var collection = this.touchCollection;
    _.each(e.changedTouches, function (touch) {
        var model = collection.getOrCreate(touch.identifier);
        model.processEvent(e, touch);
        collection.remove(model);
    });
};

TouchListener.prototype.handleTouchEnd = function (e) {
    var collection = this.touchCollection;
    _.each(e.changedTouches, function (touch) {
        var model = collection.getOrCreate(touch.identifier);
        model.processEvent(e, touch);
        collection.remove(model);
    });
};


module.exports = TouchListener;
