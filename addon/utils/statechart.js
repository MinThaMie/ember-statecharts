import { resolve } from 'rsvp';
import { Machine } from 'xstate';

export default class Statechart {
  constructor(config) {
    this.machine = Machine(config);

    this.didChangeState = config.didChangeState || function() {};
    this.context = config.context;

    this.currentState = this.machine.initialState;
  }
  send(eventName, data = {}) {
    let newState = this.machine.transition(this.currentState, { type: eventName, data }, this.context);

    this.currentState = newState;

    let { actions } = newState;

    this.didChangeState(newState);

    let chain = actions.reduce((acc, action) => {
      return acc.then(() => {
        return action(data, this.context);
      });
    }, resolve());

    return chain;
  }
}
