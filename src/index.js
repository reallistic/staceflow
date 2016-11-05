'use strict';

import Flow from './flow';

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
  CreateFlow,
  Flow,
  StartFlow,
};
