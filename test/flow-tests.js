'use strict';

import assert from 'assert';
import sinon from 'sinon';
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
    it('should add FAILED and FINISHED State and emit', () => {
      let anon = sinon.stub();
      let flow = new Flow([anon]);
      let emitSpy = sinon.spy(flow, '__emit');
      flow.failCurrentStep();
      assert.strictEqual(flow.__currentStep, -1);
      assert(flow.isFailed());
      assert(flow.isFinished());
      assert(emitSpy.calledWith(Flow.StepStatus.FAILED));
      assert(emitSpy.calledWith(Flow.StepStatus.FINISHED));
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
      assert(emitSpy.calledWith(Flow.StepStatus.FINISHED));
    });
  });
});
