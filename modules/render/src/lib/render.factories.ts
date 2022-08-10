import { InteractionHandlerPlugin } from '@rollthecloudinc/detour';

export const interationHandlerFormSubmit = () => {
  return new InteractionHandlerPlugin<string>({ id: 'panels_form_submit', title: 'Submit Panels Form', editor: undefined });
};

export const interationHandlerDialog = () => {
  return new InteractionHandlerPlugin<string>({ id: 'panels_dialog', title: 'Open Panels Dialog', editor: undefined });
};