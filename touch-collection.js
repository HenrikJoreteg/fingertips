var Backbone = require('backbone');
var TouchModel = require('./touch-model');


module.exports = Backbone.Collection.extend({
    model: TouchModel,
    getOrCreate: function (id) {
        var model = this.get(id);
        if (model) return model;
        this.add({id: id});
        return this.get(id);
    }
});
