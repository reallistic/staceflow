'use strict';

import assert from 'assert';
import sinon from 'sinon';
import Constants from '../src/constants';
import {Flow, CreateFlow} from '../src';


describe('CreateFlow', () => {
  describe('implementation', () => {
    it('should properly progess', () => {
      let step1 = sinon.spy((flow) => flow.gotoNextStep());
      let step2 = sinon.spy((flow) => flow.gotoNextStep());
      let watchSpy = sinon.spy();

      let flow = CreateFlow(step1, step2);
      flow.watch(watchSpy);
      flow.start();

      assert(flow.isStarted());
      assert(flow.isFinished());
      assert(!flow.isFailed());

      sinon.assert.calledOnce(step1);
      sinon.assert.calledOnce(step2);
      sinon.assert.callOrder(step1, step2);
      sinon.assert.callCount(watchSpy, 4);
      sinon.assert.neverCalledWith(watchSpy, flow, Constants.StepStatus.FAILED, null);
      sinon.assert.calledWithExactly(watchSpy, flow, Constants.StepStatus.STARTED, step1);
      sinon.assert.calledWithExactly(watchSpy, flow, Constants.StepStatus.FINISHED, step1);
      sinon.assert.calledWithExactly(watchSpy, flow, Constants.StepStatus.STARTED, step2);
      sinon.assert.calledWithExactly(watchSpy, flow, Constants.StepStatus.FINISHED, step2);
    });
  });

});


