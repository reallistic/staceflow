'use strict';

import Constants from './constants';
import Flow from './flow';
import Chord from './chord';

function CreateChord(...var_args) {
  return new Chord(var_args);
}

function StartChord(...var_args) {
  let chord = new Chord(var_args);
  setTimeout(() => {
    chord.start();
  }, 1);
  return chord;
}

function CreateFlow(...var_args) {
  return new Flow(var_args);
}

function StartFlow(...var_args) {
  let flow = new Flow(var_args);
  setTimeout(() => {
    flow.start();
  }, 1);
  return flow;
}

export {
  Constants,
  CreateFlow,
  Flow,
  Chord,
  StartFlow,
};
