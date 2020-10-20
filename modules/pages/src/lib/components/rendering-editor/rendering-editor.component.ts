import { Component, OnInit, Inject } from '@angular/core';
import { Snippet } from '../../models/plugin.models';
import { FormGroup, FormArray, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Pane } from '@classifieds-ui/pages';
import { TokenizerService } from '@classifieds-ui/token';
import { AttributeValue } from '@classifieds-ui/attributes';
import { AttributeContentHandler } from '../../handlers/attribute-content.handler';

@Component({
  selector: 'classifieds-ui-rendering-editor',
  templateUrl: './rendering-editor.component.html',
  styleUrls: ['./rendering-editor.component.scss']
})
export class RenderingEditorComponent implements OnInit {

  tokens: Map<string, any>;

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: { panelFormGroup: FormGroup; pane: Pane; paneIndex: number;  },
    private dialogRef: MatDialogRef<RenderingEditorComponent>,
    private tokenizerService: TokenizerService,
    private handler: AttributeContentHandler,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.tokens = this.tokenizerService.generateTokens(this.data.pane.settings);
  }

  submitted(snippet: Snippet) {
    this.replaceRenderer(snippet);
    this.dialogRef.close();
  }

  replaceRenderer(snippet: Snippet) {
    let rendererIndex;
    const setting = this.handler.rendererOverrideSettings(snippet)[0];
    const renderer = this.convertToGroup(setting);
    const formArray = (this.data.panelFormGroup.get('panes') as FormArray).at(this.data.paneIndex).get('settings') as FormArray
    formArray.controls.forEach((c, index) => {
      if(c.get('name').value === '_renderer') {
        rendererIndex = index;
      }
    })
    if(rendererIndex !== undefined) {
      formArray.insert(rendererIndex, renderer);
      formArray.removeAt(rendererIndex + 1);
    } else {
      formArray.push(renderer);
    }
  }

  convertToGroup(setting: AttributeValue): FormGroup {

    const fg = this.fb.group({
      name: new FormControl(setting.name, Validators.required),
      type: new FormControl(setting.type, Validators.required),
      displayName: new FormControl(setting.displayName, Validators.required),
      value: new FormControl(setting.value, Validators.required),
      computedValue: new FormControl(setting.value, Validators.required),
      attributes: new FormArray([])
    });

    if(setting.attributes && setting.attributes.length > 0) {
      setting.attributes.forEach(s => {
        (fg.get('attributes') as FormArray).push(this.convertToGroup(s));
      })
    }

    return fg;

  }

}
