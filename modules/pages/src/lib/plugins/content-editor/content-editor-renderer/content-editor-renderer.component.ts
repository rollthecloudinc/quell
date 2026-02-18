import { Component, inject, Injector, Input, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { AttributeValue } from '@rollthecloudinc/attributes';
import { Fab } from '../../../models/plugin.models';
import { ContentEditorHandler } from '../../../handlers/content-editor.handler';
import { ContentEditorConfig, PanelPage } from '@rollthecloudinc/panels';
import { RegisterRole } from '@rollthecloudinc/utils';
import { ContentEditorRenderer } from '../../../models/role.models';

@Component({
  selector: 'classifieds-ui-content-editor-renderer',
  templateUrl: './content-editor-renderer.component.html',
  styleUrls: ['./content-editor-renderer.component.scss'],
  standalone: false
})
@RegisterRole('content_editor_renderer')
export class ContentEditorRendererComponent implements ContentEditorRenderer {

  public injector = inject<Injector>(Injector);

  editorConfig: ContentEditorConfig = new ContentEditorConfig({ enablePreview: true, disableBackdrop: true });
  panelPage: PanelPage;
  showPreview = false;

  /*protected handler = inject(ContentEditorHandler);

  @Input()
  set settings(settings: Array<AttributeValue>) {
    this.settings$.next(settings);
  }

  iconName: string;
  ariaLabel: string;
  action: string;
  text: string;
  minifab: boolean;
  extendedfab: boolean;

  readonly settings$ = new Subject<Array<AttributeValue>>();
  readonly iconButton$ = new Subject<Fab>();

  readonly settingsSub = this.settings$.pipe(
    switchMap(s => this.handler.toObject(s)),
    tap(button => this.iconButton$.next(button))
  ).subscribe();

  readonly buttonSub = this.iconButton$.pipe(
    tap(button => {
      this.iconName = button.iconName;
      this.ariaLabel = button.ariaLabel;
      this.action = button.action;
      this.text = button.text;
      this.minifab = button.minifab;
      this.extendedfab = button.text && button.text.length > 0;
    })
  ).subscribe();*/

  onSubmit(panelPage: PanelPage) {
    console.log('submit panel page', panelPage);
    /*panelPage.id = uuid.v4(); // For now just do this here.
    this.panelPageService.add(panelPage).subscribe(() => {
      console.log('panel page created');
    });*/
  }

  onPreview(panelPage: PanelPage) {
    this.panelPage = panelPage;
    this.showPreview = true;
    console.log('preview panel page', panelPage);
  }

  onPreviewClose(){
    this.showPreview = false;
    console.log('close preview');
  }

}