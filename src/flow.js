'use strict';

import {EventEmitter} from 'fbemitter';
import Immutable from 'immutable';

export default class Flow extends EventEmitter {
  constructor(steps) {
    super();
    this.__steps = steps;
    this.__currentStep = -1;
    this.__state = new Immutable.Map();
    this.__readyState = new Immutable.Set();
    this.__changeEvent = 'flow-change';
  }

  __emit(stepStatus) {
    this.emit(this.__changeEvent, this, stepStatus);
  }

  __gotoNextStep() {
    if (this.hasNextStep()) {
      this.__currentStep = this.__currentStep + 1;
      this.__steps[this.__currentStep];
    }
    return null;
  }

  failCurrentStep() {
    this.__readyState = this.__readyState.add(
      Flow.States.FAILED
    );
    this.__emit(Flow.StepStatus.FAILED);
    this.__emit(Flow.StepStatus.FINISHED);
  }

  finish() {
    this.__readyState = this.__readyState.add(
      Flow.States.FINISHED
    );
    this.__emit(Flow.StepStatus.FINISHED);
  }

  getCurrentStep() {
    if (this.__currentStep > -1 && this.__currentStep < this.__steps.length) {
      return this.__steps[this.__currentStep];
    }
    return null;
  }

  getState() {
    return this.__state;
  }

  gotoNextStep() {
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

    if(this.hasNextStep()) {
      this.__gotoNextStep();
      this.__emit(Flow.StepStatus.STARTED);
      let step = this.getCurrentStep();
      try {
        step(this);
      }
      catch (e) {
        this.setState({'error': e});
        this.failCurrentStep();
      }
    }
  }

  hasNextStep() {
    return !this.isFinished() && !this.isLastStep();
  }

  isFailed() {
    return this.__readyState.has(Flow.States.FAILED);
  }

  isFinished() {
    if (this.__currentStep >= this.__steps.length) {
      return true;
    }
    return (this.__readyState.has(Flow.States.FINISHED) ||
            this.__readyState.has(Flow.States.FAILED));
  }

  isLastStep() {
    return this.__currentStep == this.__steps.length -1;
  }

  isStarted() {
    return this.__readyState.has(Flow.States.STARTED);
  }

  setState(nextState) {
    // Do a manual soft merge to prevent array's and objects
    // from being converted to immutable List's and Maps
    Object.keys(nextState).forEach(key => {
      this.__state = this.__state.set(key, nextState[key]);
    });
  }

  start() {
    this.__readyState = this.__readyState.add(
      Flow.States.STARTED
    );
    this.gotoNextStep();
  }

  watch(cb) {
    return this.addListener(this.__changeEvent, cb);
  }

  watchOnce(cb) {
    return this.once(this.__changeEvent, cb);
  }
}

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
