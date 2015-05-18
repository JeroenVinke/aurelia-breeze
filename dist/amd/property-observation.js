define(["exports"], function (exports) {
  "use strict";

  var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var BreezePropertyObserver = (function () {
    function BreezePropertyObserver(obj, propertyName, subscribe) {
      _classCallCheck(this, BreezePropertyObserver);

      this.obj = obj;
      this.propertyName = propertyName;
      this.subscribe = subscribe;
    }

    _createClass(BreezePropertyObserver, [{
      key: "getValue",
      value: function getValue() {
        return this.obj[this.propertyName];
      }
    }, {
      key: "setValue",
      value: function setValue(newValue) {
        this.obj[this.propertyName] = newValue;
      }
    }]);

    return BreezePropertyObserver;
  })();

  exports.BreezePropertyObserver = BreezePropertyObserver;

  var BreezeObjectObserver = (function () {
    function BreezeObjectObserver(obj) {
      _classCallCheck(this, BreezeObjectObserver);

      this.obj = obj;
      this.observers = {};
      this.callbacks = {};
      this.callbackCount = 0;
    }

    _createClass(BreezeObjectObserver, [{
      key: "subscribe",
      value: function subscribe(propertyName, callback) {
        if (this.callbacks[propertyName]) {
          this.callbacks[propertyName].push(callback);
        } else {
          this.callbacks[propertyName] = [callback];
          this.callbacks[propertyName].oldValue = this.obj[propertyName];
        }

        if (this.callbackCount === 0) {
          this.subscription = this.obj.entityAspect.propertyChanged.subscribe(this.handleChanges.bind(this));
        }

        this.callbackCount++;

        return this.unsubscribe.bind(this, propertyName, callback);
      }
    }, {
      key: "unsubscribe",
      value: function unsubscribe(propertyName, callback) {
        var callbacks = this.callbacks[propertyName],
            index = callbacks.indexOf(callback);
        if (index === -1) {
          return;
        }

        callbacks.splice(index, 1);
        if (callbacks.count = 0) {
          callbacks.oldValue = null;
          this.callbacks[propertyName] = null;
        }

        this.callbackCount--;
        if (this.callbackCount === 0) {
          this.obj.entityAspect.propertyChanged.unsubscribe(this.subscription);
        }
      }
    }, {
      key: "getObserver",
      value: function getObserver(propertyName) {
        return this.observers[propertyName] || (this.observers[propertyName] = new BreezePropertyObserver(this.obj, propertyName, this.subscribe.bind(this, propertyName)));
      }
    }, {
      key: "handleChanges",
      value: function handleChanges(change) {
        var callbacks, i, ii, newValue, oldValue, key;

        if (change.propertyName === null) {
          callbacks = this.callbacks;
          for (key in callbacks) {
            if (callbacks.hasOwnProperty(key)) {
              this.handleChanges({ propertyName: key });
            }
          }
        } else {
          callbacks = this.callbacks[change.propertyName];
        }

        if (!callbacks) {
          return;
        }

        newValue = this.obj[change.propertyName];
        oldValue = callbacks.oldValue;

        if (newValue === oldValue) {
          return;
        }

        for (i = 0, ii = callbacks.length; i < ii; i++) {
          callbacks[i](newValue, oldValue);
        }

        callbacks.oldValue = newValue;
      }
    }]);

    return BreezeObjectObserver;
  })();

  exports.BreezeObjectObserver = BreezeObjectObserver;
});