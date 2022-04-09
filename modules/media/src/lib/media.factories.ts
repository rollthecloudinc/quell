import { ContentPlugin } from "@ng-druid/content"
import { MediafilePaneRendererComponent } from "./components/mediafile-pane-renderer/mediafile-pane-renderer.component"

export const mediafileContentPluginFactory = () => {
  return new ContentPlugin<string>({
    id: 'media_file',
    title: 'Media File',
    selectionComponent: undefined,
    editorComponent: undefined,
    renderComponent: MediafilePaneRendererComponent,
    handler: undefined
  })
}