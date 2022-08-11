import { ParamPluginInstance } from '@rollthecloudinc/dparam';

export class InteractionsFormPayload {
  interactions: InteractionInteractions;
  constructor(data?: InteractionsFormPayload) {
    if (data) {
      this.interactions = data.interactions ? new InteractionInteractions(data.interactions) : new InteractionInteractions();
    }
  }
}

export class InteractionInteractions {
  listeners: Array<InteractionListener> = [];
  constructor(data?: InteractionInteractions) {
    if (data) {
      if (data.listeners && Array.isArray(data.listeners)) {
        this.listeners = data.listeners.map(l => new InteractionListener(l));
      }
    }
  }
}

export class InteractionListener {
  handler: ParamPluginInstance;
  event: ParamPluginInstance;
  constructor(data?: InteractionListener) {
    if (data) {
      this.handler = data.handler ? new ParamPluginInstance(data.handler) : new ParamPluginInstance();
      this.event = data.event ? new ParamPluginInstance(data.event) : new ParamPluginInstance();
    }
  }
}