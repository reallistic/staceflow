'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _base = require('./base');

var _base2 = _interopRequireDefault(_base);

var _constants = require('./constants');

var _constants2 = _interopRequireDefault(_constants);

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Chord = function (_Base) {
  _inherits(Chord, _Base);

  function Chord(fns) {
    _classCallCheck(this, Chord);

    var _this = _possibleConstructorReturn(this, (Chord.__proto__ || Object.getPrototypeOf(Chord)).call(this));

    _this.__fns = Array.prototype.slice.call(fns);
    _this.__doneFns = new _immutable2.default.Set();
    _this.__currentFn = -1;
    _this.__changeEvent = 'chord-change';
    return _this;
  }

  _createClass(Chord, [{
    key: '__doStep',
    value: function __doStep(step) {
      var _this2 = this;

      this.__emit(_constants2.default.StepStatus.STARTED, null, step);
      var stepNum = this.__currentFn;
      if (step instanceof _base2.default) {
        step.on(_constants2.default.States.FINISHED, function () {
          _this2.finishStep(step, stepNum);
        });
        step.on(_constants2.default.States.FAILED, function () {
          _this2.failStep(step, stepNum);
        });
        // Going to the next step is safer than calling start
        // because the Flow could have already started.
        step.gotoNextStep();
      } else {
        try {
          step(this, function () {
            return _this2.finishStep(step, stepNum);
          }, function (e) {
            return _this2.finishStep(step, stepNum, e);
          });
        } catch (e) {
          this.finishStep(step, stepNum, e);
        }
      }
      this.gotoNextStep();
    }
  }, {
    key: '__handleError',
    value: function __handleError(step, error) {
      var errors = this.getState('errors', new _immutable2.default.List());
      errors = errors.push(error);
      this.setState({ errors: errors });
      this.failStep(step);
    }
  }, {
    key: '__gotoNextStep',
    value: function __gotoNextStep() {
      if (this.hasNextStep()) {
        this.__currentFn = this.__currentFn + 1;
      }
    }
  }, {
    key: 'addStep',
    value: function addStep(step) {
      this.__fns.push(step);
    }
  }, {
    key: 'failStep',
    value: function failStep(step) {
      this.__emit(_constants2.default.StepStatus.FAILED, null, step);

      if (this.isFinished() && this.getState('errors').size === this.__fns.length) {
        this.__readyState = this.__readyState.add(_constants2.default.States.FAILED);
        this.__emit(_constants2.default.States.FAILED, _constants2.default.States.FAILED, step);
      }
    }
  }, {
    key: 'finishStep',
    value: function finishStep(step, stepNum, opt_error) {
      var _this3 = this;

      if (this.__fns[stepNum] !== step) {
        throw 'Got incorrect step num \'' + stepNum + '\' for step';
      }
      this.__doneFns = this.__doneFns.add(stepNum);

      if (opt_error != null) {
        this.__handleError(step, opt_error);
      } else {
        this.__emit(_constants2.default.StepStatus.FINISHED, null, step);
      }

      var isFinished = this.__fns.every(function (_, i) {
        return _this3.__doneFns.has(i);
      });

      if (isFinished) {
        this.finish();
      }
    }
  }, {
    key: 'getCurrentFn',
    value: function getCurrentFn() {
      if (this.__currentFn > -1 && this.__currentFn < this.__fns.length) {
        return this.__fns[this.__currentFn];
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

      if (this.hasNextStep()) {
        this.__gotoNextStep();
        // The naming here really sucks.
        // With a Chord there is no concept of a "current function" because
        // functions could be async. This needs a better name.
        var step = this.getCurrentFn();
        this.__doStep(step);
      }
    }
  }, {
    key: 'hasNextStep',
    value: function hasNextStep() {
      return !this.isFinished() && !this.isLastStep() && this.__currentFn < this.__fns.length;
    }
  }, {
    key: 'isFinished',
    value: function isFinished() {
      var _this4 = this;

      var isFinished = this.__fns.every(function (_, i) {
        return _this4.__doneFns.has(i);
      });
      return isFinished;
    }
  }, {
    key: 'isLastStep',
    value: function isLastStep() {
      return this.__currentFn === this.__fns.length - 1;
    }
  }]);

  return Chord;
}(_base2.default);

exports.default = Chord;