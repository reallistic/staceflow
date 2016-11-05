'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.StartFlow = exports.Flow = exports.CreateFlow = undefined;

var _flow = require('./flow');

var _flow2 = _interopRequireDefault(_flow);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function CreateFlow() {
  for (var _len = arguments.length, var_args = Array(_len), _key = 0; _key < _len; _key++) {
    var_args[_key] = arguments[_key];
  }

  return new _flow2.default(var_args);
}

function StartFlow() {
  for (var _len2 = arguments.length, var_args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    var_args[_key2] = arguments[_key2];
  }

  var flow = new _flow2.default(var_args);
  setTimeout(function () {
    flow.start();
  }, 1);
  return flow;
}

exports.CreateFlow = CreateFlow;
exports.Flow = _flow2.default;
exports.StartFlow = StartFlow;