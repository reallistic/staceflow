'use strict';

import assert from 'assert';
import sinon from 'sinon';

import Constants from '../src/constants';
import Chord from '../src/chord';
import Flow from '../src/flow';


describe('chord class', () => {
  describe('__gotoNextStep', () => {
    it('should only progress if hasNextStep', () => {
      let anon = sinon.stub();
      let chord = new Chord([anon]);
      let nextStepStub = sinon.stub(chord, 'hasNextStep', () => true);
      chord.__gotoNextStep();
      assert.strictEqual(chord.__currentFn, 0);
      assert.strictEqual(chord.getCurrentFn(), anon);
    });

    it('should not progress if !hasNextStep', () => {
      let chord = new Chord([]);
      let nextStepStub = sinon.stub(chord, 'hasNextStep', () => false);
      chord.__gotoNextStep();
      assert.strictEqual(chord.__currentFn, -1);
      assert.strictEqual(chord.getCurrentFn(), null);
    });
  });

  describe('__doStep', () => {
    it('should run all steps if done is not called', () => {
      let anon = sinon.stub();
      let watchSpy = sinon.stub();

      let chord = new Chord([anon, anon, anon, anon]);
      chord.watch(watchSpy);
      chord.start();
      sinon.assert.callCount(anon, 4);
      sinon.assert.neverCalledWith(watchSpy, chord, Constants.StepStatus.FINISHED, anon);
      sinon.assert.alwaysCalledWith(watchSpy, chord, Constants.StepStatus.STARTED, anon);
      sinon.assert.callCount(watchSpy, 4);
      assert(chord.isStarted());
      assert(!chord.isFinished());
      assert(!chord.isFailed());
    });

    it('should run all steps if one fails', () => {
      let anon = sinon.stub();
      let errorAnon = sinon.stub().throws({msg: 'error-test'});
      let watchSpy = sinon.stub();

      let chord = new Chord([anon, errorAnon, anon, anon]);
      chord.watch(watchSpy);
      chord.start();
      sinon.assert.callCount(anon, 3);
      sinon.assert.callCount(errorAnon, 1);
      sinon.assert.neverCalledWith(watchSpy, chord, Constants.StepStatus.FINISHED, anon);
      sinon.assert.calledWith(watchSpy, chord, Constants.StepStatus.STARTED, anon);
      sinon.assert.calledWith(watchSpy, chord, Constants.StepStatus.FAILED, errorAnon);
      sinon.assert.callCount(watchSpy, 5);
      assert(chord.isStarted());
      assert(!chord.isFinished());
      assert(!chord.isFailed());
      assert.strictEqual(chord.getState('errors').size, 1);
      assert.strictEqual(chord.getState('errors').first().msg, 'error-test');
    });

    it('should mark BaseFlow step done if it fails', () => {
      let anon = sinon.stub();
      let errorAnon = sinon.stub().throws({msg: 'error-flow-test'});
      let watchSpy = sinon.stub();
      let errorFlow = new Flow([errorAnon]);
      errorFlow.name = 'error flow';

      let chord = new Chord([anon, errorFlow, anon, anon]);
      chord.watch(watchSpy);
      chord.start();
      sinon.assert.callCount(anon, 3);
      sinon.assert.callCount(errorAnon, 1);

      sinon.assert.neverCalledWith(watchSpy, chord, Constants.StepStatus.FINISHED, anon);
      sinon.assert.calledWith(watchSpy, chord, Constants.StepStatus.STARTED, anon);
      sinon.assert.calledWith(watchSpy, chord, Constants.StepStatus.FAILED, errorFlow);
      sinon.assert.callCount(watchSpy, 5);
      assert(chord.isStarted());
      assert(!chord.isFinished());
      assert(!chord.isFailed());
      assert(errorFlow.isStarted());
      assert(errorFlow.isFinished());
      assert(errorFlow.isFailed());
      assert.strictEqual(chord.getState('errors').size, 1);
      assert.strictEqual(chord.getState('errors').first().msg, 'error-flow-test');
      assert.strictEqual(chord.__doneFns.has(1), true);
      assert.strictEqual(chord.__doneFns.size, 1);
    });

  });

  describe('isFailed', () => {
    it('should be true if all steps fail', () => {
      let errorAnon = sinon.stub().throws({msg: 'error-test'});
      let watchSpy = sinon.stub();

      let chord = new Chord([errorAnon, errorAnon, errorAnon, errorAnon]);
      chord.watch(watchSpy);
      chord.start();
      sinon.assert.callCount(errorAnon, 4);
      sinon.assert.neverCalledWith(watchSpy, chord, Constants.StepStatus.FINISHED, errorAnon);
      sinon.assert.calledWith(watchSpy, chord, Constants.StepStatus.STARTED, errorAnon);
      sinon.assert.calledWith(watchSpy, chord, Constants.StepStatus.FAILED, errorAnon);
      sinon.assert.callCount(watchSpy, 8);
      assert(chord.isStarted());
      assert(chord.isFinished());
      assert(chord.isFailed());
      let errors = chord.getState('errors');
      assert.strictEqual(errors.size, 4);
      errors.forEach(error => {
        assert.strictEqual(error.msg, 'error-test');
      });
    });

    it('should be false if at least one step doesn\'t fail', () => {
      let anon = sinon.stub();
      let errorAnon = sinon.stub().throws({msg: 'error-test'});
      let watchSpy = sinon.stub();

      let chord = new Chord([errorAnon, errorAnon, errorAnon, anon]);
      chord.watch(watchSpy);
      chord.start();
      sinon.assert.callCount(errorAnon, 3);
      sinon.assert.callCount(anon, 1);
      sinon.assert.calledWith(watchSpy, chord, Constants.StepStatus.STARTED, anon);
      sinon.assert.neverCalledWith(watchSpy, chord, Constants.StepStatus.FINISHED, anon);
      sinon.assert.neverCalledWith(watchSpy, chord, Constants.StepStatus.FINISHED, errorAnon);
      sinon.assert.calledWith(watchSpy, chord, Constants.StepStatus.STARTED, errorAnon);
      sinon.assert.calledWith(watchSpy, chord, Constants.StepStatus.FAILED, errorAnon);
      sinon.assert.callCount(watchSpy, 7);
      assert(chord.isStarted());
      assert(!chord.isFinished());
      assert(!chord.isFailed());
      let errors = chord.getState('errors');
      assert.strictEqual(errors.size, 3);
      errors.forEach(error => {
        assert.strictEqual(error.msg, 'error-test');
      });
    });
  });

  describe('finishStep', () => {
    it('should mark step done', () => {
      let finishStep;
      let errorStep;
      let anon = sinon.spy((c, done, error) => {
        finishStep = done;
        errorStep = error;
      });

      let watchSpy = sinon.stub();
      let chord = new Chord([anon]);
      chord.watch(watchSpy);
      chord.start();

      assert(chord.isStarted());
      assert(!chord.isFinished());
      assert(!chord.isFailed());
      sinon.assert.calledWith(anon, chord, finishStep, errorStep);
      assert(!chord.__doneFns.has(0));
      sinon.assert.alwaysCalledWith(watchSpy, chord, Constants.StepStatus.STARTED, anon);
      sinon.assert.callCount(watchSpy, 1);

      finishStep();

      assert(chord.isStarted());
      assert(chord.isFinished());
      assert(!chord.isFailed());
      assert(chord.__doneFns.has(0));
      sinon.assert.calledWith(watchSpy, chord, Constants.StepStatus.FINISHED, anon);
      sinon.assert.callCount(watchSpy, 2);
    });

    it('with error should mark step failed', () => {
      let finishStep;
      let errorStep;
      let anon = sinon.spy((c, done, error) => {
        finishStep = done;
        errorStep = error;
      });

      let watchSpy = sinon.stub();
      let chord = new Chord([anon]);
      chord.watch(watchSpy);
      chord.start();

      assert(chord.isStarted());
      assert(!chord.isFinished());
      assert(!chord.isFailed());
      sinon.assert.calledWith(anon, chord, finishStep, errorStep);
      assert(!chord.__doneFns.has(0));
      sinon.assert.alwaysCalledWith(watchSpy, chord, Constants.StepStatus.STARTED, anon);
      sinon.assert.callCount(watchSpy, 1);

      errorStep('error-test');

      assert(chord.isStarted());
      assert(chord.isFinished());
      assert(chord.isFailed());
      assert(chord.__doneFns.has(0));
      sinon.assert.neverCalledWith(watchSpy, chord, Constants.StepStatus.FINISHED, anon);
      sinon.assert.calledWith(watchSpy, chord, Constants.StepStatus.FAILED, anon);
      sinon.assert.callCount(watchSpy, 2);

      let errors = chord.getState('errors');
      assert.strictEqual(errors.size, 1);
      assert.strictEqual(errors.first(), 'error-test');
    });
  });

  describe('addStep', () => {
    it('adds a new step at the end', () => {
      let newAnon = sinon.stub();
      let anon = sinon.spy((c, done, error) => {
        c.addStep(newAnon);
      });

      let watchSpy = sinon.stub();
      let chord = new Chord([anon]);
      chord.watch(watchSpy);
      chord.start();

      sinon.assert.callCount(anon, 1);
      sinon.assert.callCount(newAnon, 1);
      sinon.assert.calledWith(watchSpy, chord, Constants.StepStatus.STARTED, anon);
      sinon.assert.calledWith(watchSpy, chord, Constants.StepStatus.STARTED, newAnon);
      sinon.assert.callCount(watchSpy, 2);
      sinon.assert.callOrder(anon, newAnon);
    });
  });
});
