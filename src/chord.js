'use strict';

import Base from './base';
import Constants from './constants';
import Immutable from 'immutable';

export default class Chord extends Base {
  constructor(fns) {
    super();
    this.__fns = Array.prototype.slice.call(fns);
    this.__doneFns = new Immutable.Set();
    this.__currentFn = -1;
    this.__changeEvent = 'chord-change';
  }

  __doStep(step) {
    this.__emit(Constants.StepStatus.STARTED, null, step);
    let stepNum = this.__currentFn;
    if (step instanceof Base) {
      step.on(Constants.States.FINISHED, () => {
        this.finishStep(step, stepNum);
      });
      step.on(Constants.States.FAILED, () => {
        this.failStep(step, stepNum);
      });
      // Going to the next step is safer than calling start
      // because the Flow could have already started.
      step.gotoNextStep();
    }
    else {
      try {
        step(
          this,
          () => this.finishStep(step, stepNum),
          (e) => this.finishStep(step, stepNum, e)
        );
      }
      catch (e) {
        this.finishStep(step, stepNum, e);
      }
    }
    this.gotoNextStep();
  }

  __handleError(step, error) {
    let errors = this.getState('errors', new Immutable.List());
    errors = errors.push(error);
    this.setState({errors});
    this.failStep(step);
  }

  __gotoNextStep() {
    if (this.hasNextStep()) {
      this.__currentFn = this.__currentFn + 1;
    }
  }

  addStep(step) {
    this.__fns.push(step);
  }

  failStep(step) {
    this.__emit(Constants.StepStatus.FAILED, null, step);

    if (this.isFinished() && this.getState('errors').size === this.__fns.length) {
      this.__readyState = this.__readyState.add(
        Constants.States.FAILED
      );
      this.__emit(Constants.States.FAILED, Constants.States.FAILED, step);
    }
  }

  finishStep(step, stepNum, opt_error) {
    if (this.__fns[stepNum] !== step) {
      throw `Got incorrect step num '${stepNum}' for step`;
    }
    this.__doneFns = this.__doneFns.add(stepNum);

    if (opt_error != null) {
      this.__handleError(step, opt_error);
    }
    else {
      this.__emit(Constants.StepStatus.FINISHED, null, step);
    }

    let isFinished = this.__fns.every((_, i) => {
      return this.__doneFns.has(i);
    });

    if (isFinished) {
      this.finish();
    }
  }

  getCurrentFn() {
    if (this.__currentFn > -1 && this.__currentFn < this.__fns.length) {
      return this.__fns[this.__currentFn];
    }
    return null;
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

    if(this.hasNextStep()) {
      this.__gotoNextStep();
      // The naming here really sucks.
      // With a Chord there is no concept of a "current function" because
      // functions could be async. This needs a better name.
      let step = this.getCurrentFn();
      this.__doStep(step);
    }
  }

  hasNextStep() {
    return (!this.isFinished() &&
            !this.isLastStep() &&
            this.__currentFn < this.__fns.length);
  }

  isFinished() {
    let isFinished = this.__fns.every((_, i) => {
      return this.__doneFns.has(i);
    });
    return isFinished;
  }

  isLastStep() {
    return this.__currentFn === this.__fns.length -1;
  }
}
