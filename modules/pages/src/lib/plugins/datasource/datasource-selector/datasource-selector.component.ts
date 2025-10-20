import { Component, OnInit, Input, Inject } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, FormArray, FormControl } from '@angular/forms';
import { CONTENT_PLUGIN, ContentPlugin } from '@rollthecloudinc/content';
import { MatDialog } from '@angular/material/dialog';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { ContentSelectorComponent } from '../../../components/content-selector/content-selector.component';

@Component({
    selector: 'classifieds-ui-datasource-selector',
    templateUrl: './datasource-selector.component.html',
    styleUrls: ['./datasource-selector.component.scss'],
    standalone: false
})
export class DatasourceSelectorComponent implements OnInit {

  @Input()
  panelFormGroup: UntypedFormGroup;

  // private contentPlugin: ContentPlugin;

  constructor(
    // @Inject(CONTENT_PLUGIN) contentPlugins: Array<ContentPlugin>,
    private bottomSheetRef: MatBottomSheetRef<ContentSelectorComponent>,
    private fb: UntypedFormBuilder,
    private dialog: MatDialog
  ) {
    // this.contentPlugin = contentPlugins.find(p => p.name === 'datasource');
  }

  ngOnInit(): void {
  }

  onItemSelect(datasource: string) {
    /*(this.panelFormGroup.get('panes') as FormArray).push(this.fb.group({
      contentPlugin: 'attribute',
      name: new FormControl(''),
      label: new FormControl(''),
      settings: this.fb.array(this.handler.widgetSettings(widget).map(s => this.fb.group({
        name: new FormControl(s.name, Validators.required),
        type: new FormControl(s.type, Validators.required),
        displayName: new FormControl(s.displayName, Validators.required),
        value: new FormControl(s.value, Validators.required),
        computedValue: new FormControl(s.computedValue, Validators.required),
      })))
    }));
    const formArray = (this.panelFormGroup.get('panes') as FormArray);
    const paneIndex = formArray.length - 1;
    const pane = new Pane(formArray.at(paneIndex).value);
    this.dialog.open(this.contentPlugin.editorComponent, { data: { panelFormGroup: this.panelFormGroup, pane, paneIndex } });
    this.bottomSheetRef.dismiss();*/
  }

}
