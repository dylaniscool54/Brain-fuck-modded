Backbone.Model.prototype.increase = function (key, addition) {
    this.set(key, this.get(key) + addition)
};

var Cell = Backbone.Model.extend({
    defaults: {
        value: 0
    },
    inc: function (c) {
        var val = this.get("value") + c;
        this.set("value", val);
    },
    dec: function (c) {
        var val = this.get("value") - c;
        this.set("value", val);
    },
    div: function (c) {
        var val = this.get("value") / c;
        this.set("value", val);
    },
    mul: function (c) {
        var val = this.get("value") * c;
        this.set("value", val);
    },
    mod: function (c) {
        var val = this.get("value") % c;
        this.set("value", val);
    },
    reset: function (c) {
        this.set("value", 0);
    },
    put: function (c) {
        this.set("value", c.charCodeAt(0));
    },
    char: function () {
        return String.fromCharCode(this.get("value"))
    }
});

var Tape = Backbone.Collection.extend({
    model: Cell
});

var Pointer = Backbone.Model.extend({
    defaults: {
        index: 0
    },
    left: function (c) {
        this.increase("index", -c);
    },
    right: function (c) {
        this.increase("index",  c);
    }
});
