import { Component, Inject, OnInit } from "@angular/core";
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup } from "@angular/forms";
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from "@angular/material/legacy-dialog";
import { InlineContext } from '@rollthecloudinc/context';
import { AttributeSerializerService } from '@rollthecloudinc/attributes';
import { Pane, Panel } from '@rollthecloudinc/panels';

@Component({
  selector: 'druid-tabs-panel-editor',
  templateUrl: './tabs-panel-editor.component.html',
  // styleUrls: ['./tabs-panel-editorcomponent.scss']
})
export class TabsPanelEditorComponent implements OnInit {
  contexts: Array<InlineContext> = [];
  panes: Array<Pane> = [];
  formGroup = this.fb.group({
    labels: this.fb.array([
      this.buildLabelGroup()
    ])
  });
  get labels(): UntypedFormArray {
    return this.formGroup.get('labels') as UntypedFormArray;
  }
  constructor(
    @Inject(MAT_DIALOG_DATA) private data: { panelFormGroup: UntypedFormGroup; panelIndex: number; contexts: Array<InlineContext>; },
    private dialogRef: MatDialogRef<TabsPanelEditorComponent>,
    private fb: UntypedFormBuilder,
    private attributeSerializer: AttributeSerializerService
  ) {
    this.contexts = this.data.contexts;
  }
  ngOnInit() {
    this.panes = new Panel(this.data.panelFormGroup.value).panes;
  }

  submit() {
    (this.data.panelFormGroup.get('settings') as UntypedFormArray).clear();
    this.attributeSerializer.serialize(this.formGroup.value, 'root').attributes.forEach(a => {
      console.log('label mappings');
      console.log(this.attributeSerializer.convertToGroup(a));
      (this.data.panelFormGroup.get('settings') as UntypedFormArray).push(this.attributeSerializer.convertToGroup(a));
    });
  }

  onRemoveMapping(index: number) {
    this.labels.removeAt(index);
  }

  onAddMapping() {
    this.labels.push(this.buildLabelGroup());
  }

  buildLabelGroup(): UntypedFormGroup {
    return this.fb.group({
      mapping: this.fb.control('')
    });
  }

}