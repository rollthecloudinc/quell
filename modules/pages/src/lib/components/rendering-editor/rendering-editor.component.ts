import { Component, OnInit, Inject } from '@angular/core';
import { Snippet } from '@rollthecloudinc/snippet';
import { UntypedFormGroup, UntypedFormArray, UntypedFormBuilder, Validators, UntypedFormControl } from '@angular/forms';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
// import { Pane } from 'pages';
import { Pane } from '@rollthecloudinc/panels';
import { TokenizerService } from '@rollthecloudinc/token';
import { AttributeValue } from '@rollthecloudinc/attributes';
import { AttributeContentHandler } from '../../handlers/attribute-content.handler';

@Component({
  selector: 'classifieds-ui-rendering-editor',
  templateUrl: './rendering-editor.component.html',
  styleUrls: ['./rendering-editor.component.scss']
})
export class RenderingEditorComponent implements OnInit {

  tokens: Map<string, any>;

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: { panelFormGroup: UntypedFormGroup; pane: Pane; paneIndex: number;  },
    private dialogRef: MatDialogRef<RenderingEditorComponent>,
    private tokenizerService: TokenizerService,
    private handler: AttributeContentHandler,
    private fb: UntypedFormBuilder
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
    const formArray = (this.data.panelFormGroup.get('panes') as UntypedFormArray).at(this.data.paneIndex).get('settings') as UntypedFormArray
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

  convertToGroup(setting: AttributeValue): UntypedFormGroup {

    const fg = this.fb.group({
      name: new UntypedFormControl(setting.name, Validators.required),
      type: new UntypedFormControl(setting.type, Validators.required),
      displayName: new UntypedFormControl(setting.displayName, Validators.required),
      value: new UntypedFormControl(setting.value, Validators.required),
      computedValue: new UntypedFormControl(setting.value, Validators.required),
      attributes: new UntypedFormArray([])
    });

    if(setting.attributes && setting.attributes.length > 0) {
      setting.attributes.forEach(s => {
        (fg.get('attributes') as UntypedFormArray).push(this.convertToGroup(s));
      })
    }

    return fg;

  }

}
