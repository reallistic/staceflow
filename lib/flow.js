'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _base = require('./base');

var _base2 = _interopRequireDefault(_base);

var _constants = require('./constants');

var _constants2 = _interopRequireDefault(_constants);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Flow = function (_Base) {
  _inherits(Flow, _Base);

  function Flow(steps) {
    _classCallCheck(this, Flow);

    var _this = _possibleConstructorReturn(this, (Flow.__proto__ || Object.getPrototypeOf(Flow)).call(this));

    _this.__steps = Array.prototype.slice.call(steps);
    _this.__currentStep = -1;
    _this.__changeEvent = 'flow-change';
    return _this;
  }

  _createClass(Flow, [{
    key: '__doStep',
    value: function __doStep(step) {
      var _this2 = this;

      if (step instanceof _base2.default) {
        step.on(_constants2.default.States.FINISHED, function () {
          _this2.gotoNextStep();
        });
        step.on(_constants2.default.States.FAILED, function () {
          _this2.failStep(step);
        });
      }
      _get(Flow.prototype.__proto__ || Object.getPrototypeOf(Flow.prototype), '__doStep', this).call(this, step);
    }
  }, {
    key: '__gotoNextStep',
    value: function __gotoNextStep() {
      if (this.hasNextStep()) {
        this.__currentStep = this.__currentStep + 1;
      }
    }
  }, {
    key: 'addNextStep',
    value: function addNextStep(step) {
      if (this.getCurrentStep() != null) {
        this.__steps.splice(this.__currentStep + 1, 0, step);
      } else {
        throw 'Cannot add step at invalid state';
      }
    }
  }, {
    key: 'addStep',
    value: function addStep(step) {
      this.__steps.push(step);
    }
  }, {
    key: 'failCurrentStep',
    value: function failCurrentStep() {
      var step = this.getCurrentStep();
      this.failStep(step);
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
    key: 'gotoNextStep',
    value: function gotoNextStep() {
      if (!this.isStarted()) {
        this.start();
        return;
      }

      if (this.getCurrentStep() != null) {
        this.__emit(_constants2.default.StepStatus.FINISHED, null, this.getCurrentStep());
      }

      if (!this.isFinished() && this.isLastStep()) {
        this.finish();
        return;
      }

      if (this.hasNextStep()) {
        this.__gotoNextStep();
        var step = this.getCurrentStep();
        this.__doStep(step);
      }
    }
  }, {
    key: 'hasNextStep',
    value: function hasNextStep() {
      return !this.isFinished() && !this.isLastStep() && this.__currentStep < this.__steps.length;
    }
  }, {
    key: 'isFinished',
    value: function isFinished() {
      if (this.__currentStep >= this.__steps.length) {
        return true;
      }
      return _get(Flow.prototype.__proto__ || Object.getPrototypeOf(Flow.prototype), 'isFinished', this).call(this);
    }
  }, {
    key: 'isLastStep',
    value: function isLastStep() {
      return this.__currentStep == this.__steps.length - 1;
    }
  }]);

  return Flow;
}(_base2.default);

exports.default = Flow;