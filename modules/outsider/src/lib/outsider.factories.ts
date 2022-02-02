import { ContentPlugin } from "content"
import { OutsideAppEditorComponent } from "./components/outside-app-editor/outside-app-editor.component"
import { OutsideAppRendererComponent } from "./components/outside-app-renderer/outside-app-renderer.component"
import { OutsideAppContentHandler } from "./handlers/outside-app-content.handler"

export const outsideAppPluginFactory = ({ handler }: { handler: OutsideAppContentHandler }) => {
  return new ContentPlugin<string>({
    id: 'outside_app',
    title: 'Outside App',
    selectionComponent: undefined,
    editorComponent: OutsideAppEditorComponent,
    renderComponent: OutsideAppRendererComponent,
    handler
  })
}