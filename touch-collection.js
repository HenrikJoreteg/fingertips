var Backbone = require('backbone');
var TouchModel = require('./touchModel');


module.exports = Backbone.Collection.extend({
    model: TouchModel,
    getOrCreate: function (id) {
        var model = this.get(id);

        if (model) {
            return model;
        } else {
            model = new TouchModel({id: id});
            this.add(model);
            return model;
        }
    }
});
