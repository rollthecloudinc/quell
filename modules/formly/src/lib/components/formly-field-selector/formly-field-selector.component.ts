import { Component, OnInit, Inject, Input } from '@angular/core';
import { FormGroup, FormArray, FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { MatDialog } from '@angular/material/dialog';
import { ATTRIBUTE_WIDGET, AttributeWidget, AttributeValue, AttributeTypes, WidgetPluginManager, AttributeSerializerService } from '@rollthecloudinc/attributes';
import { CONTENT_PLUGIN, ContentPlugin, ContentPluginManager } from '@rollthecloudinc/content';
import { InlineContext } from '@rollthecloudinc/context';
import { Pane } from '@rollthecloudinc/panels';
//import { AttributeContentHandler } from '../../../handlers/attribute-content.handler';
// import { MatDialog } from '@angular/material/dialog';
// import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
// import { Pane } from '@rollthecloudinc/panels';
// import { ContentSelectorComponent } from '../../../components/content-selector/content-selector.component';
import { BehaviorSubject, Observable } from 'rxjs';
import { FormlyFieldContentHandler } from '../../handlers/formly-field-content.handler';
import { FormlyFieldInstance } from '../../models/formly.models';
import { FormlyFieldEditorComponent } from '../formly-field-editor/formly-field-editor.component';

@Component({
  selector: 'classifieds-formly-field-selector',
  templateUrl: './formly-field-selector.component.html',
  styleUrls: ['./formly-field-selector.component.scss']
})
export class FormlyFieldSelectorComponent implements OnInit {

  @Input()
  panelFormGroup: FormGroup;

  @Input()
  contexts: Array<InlineContext> = [];

  fields$ = new BehaviorSubject<Map<string, string>>(new Map([ 
    ['input', 'Input'],
    ['textarea', 'Textarea'],
    ['radio', 'Radio'],
    ['checkbox', 'Checkbox'],
    ['select', 'Select'],
    ['native-select', 'Native Select'],
    ['datepicker', 'Date picker'],
    ['toggle', 'Toggle'],
    ['slider', 'Slider'],
    ['autocomplete', 'Autocomplete']
  ]));

  // attributeWidgets: Observable<Map<string, AttributeWidget<string>>>;
  // private contentPlugin: ContentPlugin;

  constructor(
    // @Inject(ATTRIBUTE_WIDGET) attributeWidgets: Array<AttributeWidget>,
    // @Inject(CONTENT_PLUGIN) contentPlugins: Array<ContentPlugin>,
    private bottomSheetRef: MatBottomSheetRef<any/*ContentSelectorComponent*/>,
    private handler: FormlyFieldContentHandler,
    private attributeSerializer: AttributeSerializerService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    // private cpm: ContentPluginManager,
    // private wpm: WidgetPluginManager
  ) {
    // this.attributeWidgets = attributeWidgets;
    // this.contentPlugin = contentPlugins.find(p => p.name === 'attribute');
  }

  ngOnInit(): void {
    // this.attributeWidgets = this.wpm.getPlugins();
  }

  onItemSelect(type: string) {
    const instance = new FormlyFieldInstance({ type, key: '' });
    (this.panelFormGroup.get('panes') as FormArray).push(this.fb.group({
      contentPlugin: 'formly_field',
      name: new FormControl(''),
      label: new FormControl(''),
      rule: new FormControl(''),
      settings: this.fb.array(this.handler.buildSettings(instance).map(s => this.attributeSerializer.convertToGroup(s)))
    }));
    const formArray = (this.panelFormGroup.get('panes') as FormArray);
    const paneIndex = formArray.length - 1;
    const pane = new Pane(formArray.at(paneIndex).value);
    this.dialog.open(FormlyFieldEditorComponent, { data: { panelFormGroup: this.panelFormGroup, pane, paneIndex, contexts: [] } });
    this.bottomSheetRef.dismiss();
  }

}