'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _fbemitter = require('fbemitter');

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Flow = function (_EventEmitter) {
  _inherits(Flow, _EventEmitter);

  function Flow(steps) {
    _classCallCheck(this, Flow);

    var _this = _possibleConstructorReturn(this, (Flow.__proto__ || Object.getPrototypeOf(Flow)).call(this));

    _this.__steps = steps;
    _this.__currentStep = -1;
    _this.__state = new _immutable2.default.Map();
    _this.__readyState = new _immutable2.default.Set();
    _this.__changeEvent = 'flow-change';
    return _this;
  }

  _createClass(Flow, [{
    key: '__emit',
    value: function __emit(stepStatus) {
      this.emit(this.__changeEvent, this, stepStatus);
    }
  }, {
    key: '__gotoNextStep',
    value: function __gotoNextStep() {
      if (this.hasNextStep()) {
        this.__currentStep = this.__currentStep + 1;
        this.__steps[this.__currentStep];
      }
      return null;
    }
  }, {
    key: 'failCurrentStep',
    value: function failCurrentStep() {
      this.__readyState = this.__readyState.add(Flow.States.FAILED);
      this.__emit(Flow.StepStatus.FAILED);
      this.__emit(Flow.StepStatus.FINISHED);
    }
  }, {
    key: 'finish',
    value: function finish() {
      this.__readyState = this.__readyState.add(Flow.States.FINISHED);
      this.__emit(Flow.StepStatus.FINISHED);
    }
  }, {
    key: 'getCurrentStep',
    value: function getCurrentStep() {
      if (this.__currentStep > -1 && this.__currentStep < this.__steps.length) {
        return this.__steps[this.__currentStep];
      }
      return null;
    }
  }, {
    key: 'getState',
    value: function getState() {
      return this.__state;
    }
  }, {
    key: 'gotoNextStep',
    value: function gotoNextStep() {
      if (!this.isStarted()) {
        this.start();
        return;
      }

      if (!this.isFinished() && this.isLastStep()) {
        this.finish();
        return;
      }

      if (this.getCurrentStep() != null) {
        this.__emit(Flow.StepStatus.FINISHED);
      }

      if (this.hasNextStep()) {
        this.__gotoNextStep();
        this.__emit(Flow.StepStatus.STARTED);
        var step = this.getCurrentStep();
        try {
          step(this);
        } catch (e) {
          this.setState({ 'error': e });
          this.failCurrentStep();
        }
      }
    }
  }, {
    key: 'hasNextStep',
    value: function hasNextStep() {
      return !this.isFinished() && !this.isLastStep();
    }
  }, {
    key: 'isFailed',
    value: function isFailed() {
      return this.__readyState.has(Flow.States.FAILED);
    }
  }, {
    key: 'isFinished',
    value: function isFinished() {
      if (this.__currentStep >= this.__steps.length) {
        return true;
      }
      return this.__readyState.has(Flow.States.FINISHED) || this.__readyState.has(Flow.States.FAILED);
    }
  }, {
    key: 'isLastStep',
    value: function isLastStep() {
      return this.__currentStep == this.__steps.length - 1;
    }
  }, {
    key: 'isStarted',
    value: function isStarted() {
      return this.__readyState.has(Flow.States.STARTED);
    }
  }, {
    key: 'setState',
    value: function setState(nextState) {
      var _this2 = this;

      // Do a manual soft merge to prevent array's and objects
      // from being converted to immutable List's and Maps
      Object.keys(nextState).forEach(function (key) {
        _this2.__state = _this2.__state.set(key, nextState[key]);
      });
    }
  }, {
    key: 'start',
    value: function start() {
      this.__readyState = this.__readyState.add(Flow.States.STARTED);
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

  return Flow;
}(_fbemitter.EventEmitter);

exports.default = Flow;


Flow.States = {
  STARTED: 'flow-started',
  FINISHED: 'flow-finished',
  FAILED: 'flow-failed'
};

Flow.StepStatus = {
  STARTED: 'step-started',
  FINISHED: 'step-finished',
  FAILED: 'step-failed'
};