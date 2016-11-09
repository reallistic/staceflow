'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _constants = require('./constants');

var _constants2 = _interopRequireDefault(_constants);

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

var _fbemitter = require('fbemitter');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Base = function (_EventEmitter) {
  _inherits(Base, _EventEmitter);

  function Base() {
    _classCallCheck(this, Base);

    var _this = _possibleConstructorReturn(this, (Base.__proto__ || Object.getPrototypeOf(Base)).call(this));

    _this.__parentFlow = null;
    _this.__autoLink = false;
    _this.__state = new _immutable2.default.Map();
    _this.__readyState = new _immutable2.default.Set();
    _this.__changeEvent = 'change';
    return _this;
  }

  _createClass(Base, [{
    key: '__doStep',
    value: function __doStep(step) {
      this.__emit(_constants2.default.StepStatus.STARTED, this.__changeEvent, step);
      if (step instanceof Base) {
        // Going to the next step is safer than calling start
        // because the Flow could have already started.
        if (this.__autoLink) {
          step.linkToParentState(this);
        }
        step.gotoNextStep();
      } else {
        try {
          step(this);
        } catch (e) {
          this.__handleError(step, e);
        }
      }
    }
  }, {
    key: '__emit',
    value: function __emit(stepStatus, opt_event, opt_step) {
      if (opt_event == null) {
        opt_event = this.__changeEvent;
      }
      this.emit(opt_event, this, stepStatus, opt_step);
    }
  }, {
    key: '__handleError',
    value: function __handleError(step, error) {
      this.setState({ 'error': e });
      this.failStep(step);
    }
  }, {
    key: 'autoLinkChildFlows',
    value: function autoLinkChildFlows(enabled) {
      this.__autoLink = enabled;
    }
  }, {
    key: 'failStep',
    value: function failStep(step) {
      this.__readyState = this.__readyState.add(_constants2.default.States.FAILED);
      this.__emit(_constants2.default.States.FAILED, _constants2.default.States.FAILED, step);
      this.__emit(_constants2.default.StepStatus.FAILED, null, step);
    }
  }, {
    key: 'finish',
    value: function finish() {
      this.__readyState = this.__readyState.add(_constants2.default.States.FINISHED);
      this.__emit(_constants2.default.States.FINISHED, _constants2.default.States.FINISHED);
    }
  }, {
    key: 'getState',
    value: function getState(opt_key, opt_value) {
      if (this.__parentFlow != null) {
        return this.__parentFlow.getState(opt_key, opt_value);
      }
      if (opt_key != null) {
        return this.__state.get(opt_key, opt_value);
      }
      return this.__state;
    }
  }, {
    key: 'gotoNextStep',
    value: function gotoNextStep() {
      throw 'Not Implemented';
    }
  }, {
    key: 'isFailed',
    value: function isFailed() {
      return this.__readyState.has(_constants2.default.States.FAILED);
    }
  }, {
    key: 'isFinished',
    value: function isFinished() {
      return this.__readyState.has(_constants2.default.States.FINISHED) || this.__readyState.has(_constants2.default.States.FAILED);
    }
  }, {
    key: 'isStarted',
    value: function isStarted() {
      return this.__readyState.has(_constants2.default.States.STARTED);
    }
  }, {
    key: 'linkToParentState',
    value: function linkToParentState(parentFlow) {
      if (!(parentFlow instanceof Base)) {
        throw 'Expected flow object';
      }

      this.__parentFlow = parentFlow;
    }
  }, {
    key: 'on',
    value: function on(event, cb) {
      return this.addListener(event, cb);
    }
  }, {
    key: 'onOnce',
    value: function onOnce(event, cb) {
      return this.once(event, cb);
    }
  }, {
    key: 'setState',
    value: function setState(nextState) {
      var _this2 = this;

      if (this.__parentFlow != null) {
        return this.__parentFlow.setState(nextState);
      }
      // Do a manual soft merge to prevent array's and objects
      // from being converted to immutable List's and Maps
      Object.keys(nextState).forEach(function (key) {
        _this2.__state = _this2.__state.set(key, nextState[key]);
      });
    }
  }, {
    key: 'start',
    value: function start() {
      this.__readyState = this.__readyState.add(_constants2.default.States.STARTED);
      this.__emit(_constants2.default.States.STARTED, _constants2.default.States.STARTED);
      this.gotoNextStep();
    }
  }, {
    key: 'watch',
    value: function watch(cb) {
      return this.addListener(this.__changeEvent, cb);
    }
  }, {
    key: 'watchOnce',
    value: function watchOnce(cb) {
      return this.once(this.__changeEvent, cb);
    }
  }]);

  return Base;
}(_fbemitter.EventEmitter);

exports.default = Base;