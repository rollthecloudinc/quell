import { InteractionEventPlugin } from "./models/interaction-event.models";

export const interactionEventDomFactory = () => {
  return new InteractionEventPlugin<string>({ title: 'DOM', id: 'dom', editor: undefined });
};