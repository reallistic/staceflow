'use strict';

import assert from 'assert';
import sinon from 'sinon';

import Constants from '../src/constants';
import Chord from '../src/chord';
import Base from '../src/base';


describe('base class', () => {
  describe('linkToParentState', () => {
    it('mutates parent state', () => {
      let parent = new Base();
      let child = new Base();
      let anon = sinon.stub();

      child.linkToParentState(parent);

      child.setState({'test': 'val'});
      assert.equal(child.getState('test'), 'val');
      assert.equal(parent.getState('test'), 'val');
      assert.equal(child.__state.get('test', 'not-exist'), 'not-exist');
    });
  });
});

