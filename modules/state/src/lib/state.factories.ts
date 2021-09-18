import { AttributeValue } from "attributes";
import { ContextPlugin } from "context";
import { ContextStateEditorComponent } from "./components/context-state-editor/context-state-editor.component";
import { StateContextResolver } from "./contexts/state-context.resolver";

export const stateContextFactory = (resolver: StateContextResolver) => {
  const baseObject = new AttributeValue();
  return new ContextPlugin<string>({ id: 'state', name: 'state', title: 'State', baseObject, resolver, editorComponent: ContextStateEditorComponent });
};