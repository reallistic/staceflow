'use strict';

import Constants from './constants';
import Immutable from 'immutable';
import {EventEmitter} from 'fbemitter';

export default class Base extends EventEmitter {
  constructor() {
    super();
    this.__parentFlow = null;
    this.__autoLink = false;
    this.__state = new Immutable.Map();
    this.__readyState = new Immutable.Set();
    this.__changeEvent = 'change';
  }

  __doStep(step) {
    this.__emit(Constants.StepStatus.STARTED, this.__changeEvent, step);
    if (step instanceof Base) {
      // Going to the next step is safer than calling start
      // because the Flow could have already started.
      if (this.__autoLink) {
        step.linkToParentState(this);
      }
      step.gotoNextStep();
    }
    else {
      try {
        step(this);
      }
      catch (e) {
        this.__handleError(step, e);
      }
    }
  }

  __emit(stepStatus, opt_event, opt_step) {
    if (opt_event == null) {
      opt_event = this.__changeEvent;
    }
    this.emit(opt_event, this, stepStatus, opt_step);
  }

  __handleError(step, error) {
    this.setState({'error': e});
    this.failStep(step);
  }

  autoLinkChildFlows(enabled) {
    this.__autoLink = enabled;
  }

  failStep(step) {
    this.__readyState = this.__readyState.add(
      Constants.States.FAILED
    );
    this.__emit(Constants.States.FAILED, Constants.States.FAILED, step);
    this.__emit(Constants.StepStatus.FAILED, null, step);
  }

  finish() {
    this.__readyState = this.__readyState.add(
      Constants.States.FINISHED
    );
    this.__emit(Constants.States.FINISHED, Constants.States.FINISHED);
  }

  getState(opt_key, opt_value) {
    if (this.__parentFlow != null) {
      return this.__parentFlow.getState(opt_key, opt_value);
    }
    if (opt_key != null) {
      return this.__state.get(opt_key, opt_value);
    }
    return this.__state;
  }

  gotoNextStep() {
    throw 'Not Implemented';
  }

  isFailed() {
    return this.__readyState.has(Constants.States.FAILED);
  }

  isFinished() {
    return (this.__readyState.has(Constants.States.FINISHED) ||
            this.__readyState.has(Constants.States.FAILED));
  }

  isStarted() {
    return this.__readyState.has(Constants.States.STARTED);
  }

  linkToParentState(parentFlow) {
    if (!(parentFlow instanceof Base)) {
      throw 'Expected flow object';
    }

    this.__parentFlow = parentFlow;
  }

  on(event, cb) {
    return this.addListener(event, cb);
  }

  onOnce(event, cb) {
    return this.once(event, cb);
  }

  setState(nextState) {
    if (this.__parentFlow != null) {
      return this.__parentFlow.setState(nextState);
    }
    // Do a manual soft merge to prevent array's and objects
    // from being converted to immutable List's and Maps
    Object.keys(nextState).forEach(key => {
      this.__state = this.__state.set(key, nextState[key]);
    });
  }

  start() {
    this.__readyState = this.__readyState.add(
      Constants.States.STARTED
    );
    this.__emit(Constants.States.STARTED, Constants.States.STARTED);
    this.gotoNextStep();
  }

  watch(cb) {
    return this.addListener(this.__changeEvent, cb);
  }

  watchOnce(cb) {
    return this.once(this.__changeEvent, cb);
  }
}
