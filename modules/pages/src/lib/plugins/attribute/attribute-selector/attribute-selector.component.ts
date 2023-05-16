import { Component, OnInit, Inject, Input } from '@angular/core';
import { UntypedFormGroup, UntypedFormArray, UntypedFormBuilder, UntypedFormControl, Validators } from '@angular/forms';
import { ATTRIBUTE_WIDGET, AttributeWidget, AttributeValue, AttributeTypes, WidgetPluginManager } from '@rollthecloudinc/attributes';
import { CONTENT_PLUGIN, ContentPlugin, ContentPluginManager } from '@rollthecloudinc/content';
import { AttributeContentHandler } from '../../../handlers/attribute-content.handler';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { Pane } from '@rollthecloudinc/panels';
import { ContentSelectorComponent } from '../../../components/content-selector/content-selector.component';
import { Observable } from 'rxjs';

@Component({
  selector: 'classifieds-ui-attribute-selector',
  templateUrl: './attribute-selector.component.html',
  styleUrls: ['./attribute-selector.component.scss']
})
export class AttributeSelectorComponent implements OnInit {

  @Input()
  panelFormGroup: UntypedFormGroup;

  attributeWidgets: Observable<Map<string, AttributeWidget<string>>>;
  // private contentPlugin: ContentPlugin;

  constructor(
    // @Inject(ATTRIBUTE_WIDGET) attributeWidgets: Array<AttributeWidget>,
    // @Inject(CONTENT_PLUGIN) contentPlugins: Array<ContentPlugin>,
    private bottomSheetRef: MatBottomSheetRef<ContentSelectorComponent>,
    private handler: AttributeContentHandler,
    private fb: UntypedFormBuilder,
    private dialog: MatDialog,
    private cpm: ContentPluginManager,
    private wpm: WidgetPluginManager
  ) {
    // this.attributeWidgets = attributeWidgets;
    // this.contentPlugin = contentPlugins.find(p => p.name === 'attribute');
  }

  ngOnInit(): void {
    this.attributeWidgets = this.wpm.getPlugins();
  }

  onItemSelect(widget: AttributeWidget<string>) {
    console.log(widget);
    (this.panelFormGroup.get('panes') as UntypedFormArray).push(this.fb.group({
      contentPlugin: 'attribute',
      name: new UntypedFormControl(''),
      label: new UntypedFormControl(''),
      rule: new UntypedFormControl(''),
      settings: this.fb.array(this.handler.widgetSettings(widget).map(s => this.fb.group({
        name: new UntypedFormControl(s.name, Validators.required),
        type: new UntypedFormControl(s.type, Validators.required),
        displayName: new UntypedFormControl(s.displayName, Validators.required),
        value: new UntypedFormControl(s.value, Validators.required),
        computedValue: new UntypedFormControl(s.computedValue, Validators.required),
      })))
    }));
    const formArray = (this.panelFormGroup.get('panes') as UntypedFormArray);
    const paneIndex = formArray.length - 1;
    const pane = new Pane(formArray.at(paneIndex).value);
    this.cpm.getPlugin('attribute').subscribe(plugin => {
      this.dialog.open(plugin.editorComponent, { data: { panelFormGroup: this.panelFormGroup, pane, paneIndex } });
    });
    this.bottomSheetRef.dismiss();
  }

}
