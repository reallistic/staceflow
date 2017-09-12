# Stace Flow
Stace is a flow control library to help facilitate sequential promise/function execution.
Api Reference is here: reallistic.github.io/staceflow/

![Build Status](https://circleci.com/gh/reallistic/staceflow/tree/master.svg?style=shield)


# Rationale
Normally when working in frameworks like React, EventEmitters and state are used to facilitate business logic throughout the lifecycle of components and flux-like libraries.
This library seeks to bring that functionality and more to any and all facets of Javascript.
Stace can be used to take a collection of promises and give you back an event emitter.
It can also be used to facilitate composable flows such as OAuth.
Or, it can be used to flatten out a promise.

# Installation
```
npm install StaceFlow
// or
yarn add StaceFlow
```

# Examples
### Simple Example
Without Stace:
```
function foo() {
    return service1.foo().then(data => {
        return service2.foo(data.param).then(moreData => {
            return service3.foo(data.param2, moreData.parm).then(() => data);
        });
    });
}
```
With Stace:
```
import { StartFlow, Constants } from 'StaceFlow';

function dataRetreiver(id) {
    let flow = CreateFlow(
        flow => {
            service1.foo().then(data => {
                flow.setState({data});
                flow.gotoNextStep();
            },
            error => {
                flow.setState({error});
                flow.failCurrentStep();
            });
        },
        flow => {
            service2.foo(flow.getState('data').param).then(moreData => {
                flow.setState({moreData});
                flow.gotoNextStep();
            },
            error => {
                flow.setState({error});
                flow.failCurrentStep();
            });
        },
        flow => {
            let data = flow.getState('data');
            let moreData = flow.getState('moreData');
            service3.foo(data.param2, moreData.param).then(() => {
                flow.gotoNextStep();
            },
            error => {
                flow.setState({error});
                flow.failCurrentStep();
            });
        });
    return new Promise((resolve, reject) => {
        flow.on(Constants.States.FINISHED, () => resolve(flow.getState('data')));
        flow.on(Constants.States.FAILED, (step) => reject(flow.getState('error')));
        flow.start();
    });
}
```
Thats not very helpful. We just added more code....

### Composing flows
But then again what if we need to know which step failed?
```
function callService1(flow) {
    service1.foo().then(data => {
        flow.setState({data});
        flow.gotoNextStep();
    },
    error => {
        flow.setState({error});
        flow.failCurrentStep();
    });
}


function callService2(flow) {
    service2.foo(flow.getState('data').param).then(moreData => {
        flow.setState({moreData});
        flow.gotoNextStep();
    },
    error => {
        flow.setState({error});
        flow.failCurrentStep();
    });
}


function callService3(flow) {
    let data = flow.getState('data');
    let moreData = flow.getState('moreData');
    service3.foo(data.param2, moreData.param).then(() => {
        flow.gotoNextStep();
    },
    error => {
        flow.setState({error});
        flow.failCurrentStep();
    });
}


function dataRetreiver(id) {
    let flow = CreateFlow(
        callService1,
        callService2,
        callService3
    );
    return new Promise((resolve, reject) => {
        flow.on(Constants.States.FINISHED, () => resolve(flow.getState('data')));
        flow.on(Constants.States.FAILED, (step) => {
            if (step === callService3) {
                console.error('someone should check out service3', flow.getState('error'));
                resolve(flow.getState('data'));
            }
            else {
                reject(flow.getState('error'))
            }
        });
        flow.start();
    });
}
```
Thats a little more useful.

#### Reusing flows
Sometimes, all of them need not be called:

```
const Flow1 = [callService1, callService3];
const Flow2 = [callService1, callService2, callService3];

function dataRetreiver(opt_knownData) {
    let flow;
    if (opt_knownData) {
        flow = CreateFlow.apply(null, Flow1);
        flow.setState({moreData: opt_knownData});
    }
    else {
        flow = CreateFlow.apply(null, Flow2);
    }
    flow.start();
    return flow;
}
```
#### Adding steps
You can also add steps after the current one if needed:
```
function assertUser(flow) {
    if (flow.getState('authenticated')) {
        flow.gotoNextStep();
    }
    else {
        flow.addNextStep(authenticateUser);
        flow.gotoNextStep();
    }
}
```

or at the end of the flow:
```
function parseData(flow) {
    if (detectAnomaly(flow.getState('data'))) {
        flow.addStep(logResult);
    }
}
```
