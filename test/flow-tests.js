'use strict';

import assert from 'assert';
import sinon from 'sinon';

import Constants from '../src/constants';
import Flow from '../src/flow';

describe('flow class', () => {
  describe('__gotoNextStep', () => {
    it('should only progress if hasNextStep', () => {
      let anon = sinon.stub();
      let flow = new Flow([anon]);
      let nextStepStub = sinon.stub(flow, 'hasNextStep', () => true);
      flow.__gotoNextStep();
      assert.strictEqual(flow.__currentStep, 0);
      assert.strictEqual(flow.getCurrentStep(), anon);
    });

    it('should not progress if !hasNextStep', () => {
      let flow = new Flow([]);
      let nextStepStub = sinon.stub(flow, 'hasNextStep', () => false);
      flow.__gotoNextStep();
      assert.strictEqual(flow.__currentStep, -1);
      assert.strictEqual(flow.getCurrentStep(), null);
    });
  });

  describe('failCurrentStep', () => {
    it('should add FAILED State and emit', () => {
      let anon = sinon.stub();
      let flow = new Flow([anon]);
      let emitSpy = sinon.spy(flow, '__emit');
      assert(!flow.isFinished());
      flow.failCurrentStep();
      assert.strictEqual(flow.__currentStep, -1);
      assert(flow.isFailed());
      assert(flow.isFinished());
      sinon.assert.calledWith(emitSpy, Constants.StepStatus.FAILED, null, null);
    });
  });

  describe('failCurrentStep', () => {
    it('should add FAILED State and emit with current step', () => {
      let anon = sinon.stub();
      let flow = new Flow([anon]);
      let emitSpy = sinon.spy(flow, '__emit');
      assert(!flow.isFinished());
      flow.__gotoNextStep();
      flow.failCurrentStep();
      assert.strictEqual(flow.__currentStep, 0);
      assert(flow.isFailed());
      assert(flow.isFinished());
      sinon.assert.calledWith(emitSpy, Constants.StepStatus.FAILED, null, anon);
    });
  });

  describe('finish', () => {
    it('should add FINISHED State and emit', () => {
      let anon = sinon.stub();
      let flow = new Flow([anon]);
      let emitSpy = sinon.spy(flow, '__emit');
      flow.finish();
      assert.strictEqual(flow.__currentStep, -1);
      assert(flow.isFinished());
      sinon.assert.calledWith(emitSpy, Constants.States.FINISHED, Constants.States.FINISHED);
    });
  });
});
