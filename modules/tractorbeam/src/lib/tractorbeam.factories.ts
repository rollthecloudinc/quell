import { ContextPlugin } from '@ng-druid/context';
import { ContextModuleEditorComponent } from "./components/context-module-editor/context-module-editor.component";
import { ModuleResolver } from "./resolvers/module.resolver";

export const moduleContextFactory = ({ moduleResolver }: { moduleResolver: ModuleResolver }) => {
  return new ContextPlugin({
    id: 'module',
    name: 'module',
    title: 'Module',
    baseObject: {},
    resolver: moduleResolver,
    editorComponent: ContextModuleEditorComponent
  });
};