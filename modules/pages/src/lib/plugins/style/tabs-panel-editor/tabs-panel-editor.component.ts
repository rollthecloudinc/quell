import { Component, Inject, OnInit } from "@angular/core";
import { FormArray, FormBuilder, FormGroup } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { InlineContext } from "context";
import { AttributeSerializerService } from '@ng-druid/attributes';
import { Pane, Panel } from "panels";

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
  get labels(): FormArray {
    return this.formGroup.get('labels') as FormArray;
  }
  constructor(
    @Inject(MAT_DIALOG_DATA) private data: { panelFormGroup: FormGroup; panelIndex: number; contexts: Array<InlineContext>; },
    private dialogRef: MatDialogRef<TabsPanelEditorComponent>,
    private fb: FormBuilder,
    private attributeSerializer: AttributeSerializerService
  ) {
    this.contexts = this.data.contexts;
  }
  ngOnInit() {
    this.panes = new Panel(this.data.panelFormGroup.value).panes;
  }

  submit() {
    (this.data.panelFormGroup.get('settings') as FormArray).clear();
    this.attributeSerializer.serialize(this.formGroup.value, 'root').attributes.forEach(a => {
      console.log('label mappings');
      console.log(this.attributeSerializer.convertToGroup(a));
      (this.data.panelFormGroup.get('settings') as FormArray).push(this.attributeSerializer.convertToGroup(a));
    });
  }

  onRemoveMapping(index: number) {
    this.labels.removeAt(index);
  }

  onAddMapping() {
    this.labels.push(this.buildLabelGroup());
  }

  buildLabelGroup(): FormGroup {
    return this.fb.group({
      mapping: this.fb.control('')
    });
  }

}