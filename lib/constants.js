'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var StepStatus = exports.StepStatus = {
  STARTED: 'step-started',
  FINISHED: 'step-finished',
  FAILED: 'step-failed'
};

var States = exports.States = {
  STARTED: 'flow-started',
  FINISHED: 'flow-finished',
  FAILED: 'flow-failed'
};

exports.default = {
  StepStatus: StepStatus,
  States: States
};