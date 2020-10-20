import { Component, OnInit, OnChanges, SimpleChanges, Input, Inject, EventEmitter, Output, ViewChild, ComponentFactoryResolver } from '@angular/core';
import { AttributeValue } from '@classifieds-ui/attributes';
import { ContentPlugin, CONTENT_PLUGIN } from '@classifieds-ui/content';
import { PaneContentHostDirective } from '../../directives/pane-content-host.directive';
import { PanelContentHandler } from '../../handlers/panel-content.handler';
import { PanelPage } from '../../models/page.models';
import { InlineContext } from '../../models/context.models';

@Component({
  selector: 'classifieds-ui-editable-pane',
  templateUrl: './editable-pane.component.html',
  styleUrls: ['./editable-pane.component.scss']
})
export class EditablePaneComponent implements OnInit, OnChanges {

  @Input()
  pluginName: string;

  @Input()
  settings: Array<AttributeValue> = [];

  @Input()
  name: string;

  @Input()
  label: string;

  @Input()
  panelIndex: number;

  @Input()
  paneIndex: number;

  @Input()
  locked = false;

  @Input()
  rootContext: InlineContext;

  @Input()
  contexts: Array<InlineContext> = [];

  @Output()
  edit = new EventEmitter();

  @Output()
  delete = new EventEmitter();

  @Output()
  rules = new EventEmitter();

  @Output()
  rendererOverride = new EventEmitter();

  @Output()
  removeRendererOverride = new EventEmitter();

  @Output()
  nestedUpdate = new EventEmitter<PanelPage>();

  @Output()
  heightChange = new EventEmitter();

  displayOverride = false;
  hasOverride = false;

  contentPlugin: ContentPlugin;

  preview = false;

  private contentPlugins: Array<ContentPlugin> = [];

  panelPage: PanelPage;

  @ViewChild(PaneContentHostDirective, { static: false }) contentPaneHost: PaneContentHostDirective;
  @ViewChild('contentEditor', { static: false }) contentEditor: any;

  constructor(
    @Inject(CONTENT_PLUGIN) contentPlugins: Array<ContentPlugin>,
    private componentFactoryResolver: ComponentFactoryResolver,
    private panelHandler: PanelContentHandler
  ) {
    this.contentPlugins = contentPlugins;
  }

  ngOnInit(): void {
    this.contentPlugin = this.contentPlugins.find(p => p.name === this.pluginName);
    this.displayOverride = this.contentPlugin.handler.implementsRendererOverride();
    this.contentPlugin.handler.hasRendererOverride(this.settings).subscribe(r => this.hasOverride = !!r);
    if(this.pluginName === 'panel') {
      this.panelHandler.toObject(this.settings).subscribe(p => {
        this.panelPage = p;
      });
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    this.contentPlugin = this.contentPlugins.find(p => p.name === this.pluginName);
    this.displayOverride = this.contentPlugin.handler.implementsRendererOverride();
    this.contentPlugin.handler.hasRendererOverride(this.settings).subscribe(r => this.hasOverride = !!r);
  }

  onEditClick() {
    this.edit.emit();
  }

  onRulesClick() {
    this.rules.emit();
  }

  onDeleteClick() {
    this.delete.emit();
  }

  onPreviewClick() {
    this.preview = true;
    if(this.contentPaneHost !== undefined) {
      this.renderPaneContent();
    }
    setTimeout(() => this.heightChange.emit());
  }

  onOverrideClick() {
    this.rendererOverride.emit();
  }

  onRemoveOverrideClick() {
    this.removeRendererOverride.emit();
  }

  onNestedUpdate(panelPage: PanelPage) {
    this.nestedUpdate.emit(panelPage);
  }

  onDisablePreviewClick() {
    this.preview = false;
    if(this.contentPaneHost !== undefined) {
      const viewContainerRef = this.contentPaneHost.viewContainerRef;
      viewContainerRef.clear();
    }
    setTimeout(() => this.heightChange.emit());
  }

  onAfterCollapse() {
    this.heightChange.emit();
  }

  onAfterExpand() {
    this.heightChange.emit();
  }

  renderPaneContent() {
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(this.contentPlugin.renderComponent);

    const viewContainerRef = this.contentPaneHost.viewContainerRef;
    viewContainerRef.clear();

    const componentRef = viewContainerRef.createComponent(componentFactory);
    (componentRef.instance as any).settings = this.settings;
  }

}
