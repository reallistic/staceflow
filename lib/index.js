'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.StartFlow = exports.Chord = exports.Flow = exports.CreateFlow = exports.Constants = undefined;

var _constants = require('./constants');

var _constants2 = _interopRequireDefault(_constants);

var _flow = require('./flow');

var _flow2 = _interopRequireDefault(_flow);

var _chord = require('./chord');

var _chord2 = _interopRequireDefault(_chord);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function CreateChord() {
  for (var _len = arguments.length, var_args = Array(_len), _key = 0; _key < _len; _key++) {
    var_args[_key] = arguments[_key];
  }

  return new _chord2.default(var_args);
}

function StartChord() {
  for (var _len2 = arguments.length, var_args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    var_args[_key2] = arguments[_key2];
  }

  var chord = new _chord2.default(var_args);
  setTimeout(function () {
    chord.start();
  }, 1);
  return chord;
}

function CreateFlow() {
  for (var _len3 = arguments.length, var_args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
    var_args[_key3] = arguments[_key3];
  }

  return new _flow2.default(var_args);
}

function StartFlow() {
  for (var _len4 = arguments.length, var_args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
    var_args[_key4] = arguments[_key4];
  }

  var flow = new _flow2.default(var_args);
  setTimeout(function () {
    flow.start();
  }, 1);
  return flow;
}

exports.Constants = _constants2.default;
exports.CreateFlow = CreateFlow;
exports.Flow = _flow2.default;
exports.Chord = _chord2.default;
exports.StartFlow = StartFlow;