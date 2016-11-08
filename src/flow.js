'use strict';

import Base from './base';
import Constants from './constants';

export default class Flow extends Base {
  constructor(steps) {
    super();
    this.__steps = Array.prototype.slice.call(steps);
    this.__currentStep = -1;
    this.__changeEvent = 'flow-change';
  }

  __doStep(step) {
    if (step instanceof Base) {
      step.on(Constants.States.FINISHED, () => {
        this.gotoNextStep();
      });
      step.on(Constants.States.FAILED, () => {
        this.failStep(step);
      });
    }
    super.__doStep(step);
  }

  __gotoNextStep() {
    if (this.hasNextStep()) {
      this.__currentStep = this.__currentStep + 1;
    }
  }

  addNextStep(step) {
    if (this.getCurrentStep() != null) {
      this.__steps.splice(this.__currentStep + 1, 0, step);
    }
    else {
      throw 'Cannot add step at invalid state';
    }
  }

  addStep(step) {
    this.__steps.push(step);
  }

  failCurrentStep() {
    let step = this.getCurrentStep();
    this.failStep(step);
  }

  getCurrentStep() {
    if (this.__currentStep > -1 && this.__currentStep < this.__steps.length) {
      return this.__steps[this.__currentStep];
    }
    return null;
  }

  gotoNextStep() {
    if (!this.isStarted()) {
      this.start();
      return;
    }

    if (this.getCurrentStep() != null) {
      this.__emit(Constants.StepStatus.FINISHED, null, this.getCurrentStep());
    }

    if (!this.isFinished() && this.isLastStep()) {
      this.finish();
      return;
    }

    if(this.hasNextStep()) {
      this.__gotoNextStep();
      let step = this.getCurrentStep();
      this.__doStep(step);
    }
  }

  hasNextStep() {
    return (!this.isFinished() &&
            !this.isLastStep() &&
            this.__currentStep < this.__steps.length);
  }

  isFinished() {
    if (this.__currentStep >= this.__steps.length) {
      return true;
    }
    return super.isFinished();
  }

  isLastStep() {
    return this.__currentStep == this.__steps.length -1;
  }
}
