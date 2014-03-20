var Collection = require('ampersand-collection');
var TouchModel = require('./touch-model');


module.exports = Collection.extend({
    model: TouchModel,
    getOrCreate: function (id) {
        var model = this.get(id);
        if (model) return model;
        this.add({id: id});
        return this.get(id);
    }
});
