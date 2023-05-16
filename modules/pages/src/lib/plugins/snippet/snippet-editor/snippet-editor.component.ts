import { Component, OnInit, Inject } from '@angular/core';
import { Validators, UntypedFormGroup, UntypedFormControl, UntypedFormArray, UntypedFormBuilder } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AttributeTypes } from '@rollthecloudinc/attributes';
import { Pane } from '@rollthecloudinc/panels';
// import { Snippet } from '../../../models/plugin.models';
// import { SnippetContentHandler } from '../../../handlers/snippet-content.handler';
import { Snippet } from '@rollthecloudinc/snippet';
import { SnippetContentHandler } from '../../../handlers/snippet-content.handler';

@Component({
  selector: 'classifieds-ui-snippet-editor2',
  templateUrl: './snippet-editor.component.html',
  styleUrls: ['./snippet-editor.component.scss']
})
export class SnippetEditorComponent implements OnInit {

  snippet: Snippet;

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: { panelFormGroup: UntypedFormGroup; pane: Pane; paneIndex: number;  },
    private fb: UntypedFormBuilder,
    private handler: SnippetContentHandler
  ) { }

  ngOnInit(): void {
    if(this.data.pane !== undefined) {
      this.handler.toObject(this.data.pane.settings).subscribe((snippet: Snippet) => {
        this.snippet = snippet;
      });
    }
  }

  onSubmit(snippet: Snippet) {
    if(this.data.paneIndex === undefined) {
      (this.data.panelFormGroup.get('panes') as UntypedFormArray).push(this.fb.group({
        contentPlugin: 'snippet',
        name: new UntypedFormControl(''),
        label: new UntypedFormControl(''),
        rule: new UntypedFormControl(''),
        settings: new UntypedFormArray(this.buildSettings(snippet))
      }));
    } else {
      const paneForm = (this.data.panelFormGroup.get('panes') as UntypedFormArray).at(this.data.paneIndex);
      (paneForm.get('settings') as UntypedFormArray).clear();
      this.buildSettings(snippet).forEach(s => {
        (paneForm.get('settings') as UntypedFormArray).push(s)
      });
    }
  }

  buildSettings(snippet: Snippet): Array<UntypedFormGroup> {
    return [
      this.fb.group({
        name: new UntypedFormControl('contentType', Validators.required),
        type: new UntypedFormControl(AttributeTypes.Text, Validators.required),
        displayName: new UntypedFormControl('Content Type', Validators.required),
        value: new UntypedFormControl(snippet.contentType, Validators.required),
        computedValue: new UntypedFormControl(snippet.contentType, Validators.required),
      }),
      this.fb.group({
        name: new UntypedFormControl('content', Validators.required),
        type: new UntypedFormControl(AttributeTypes.Text, Validators.required),
        displayName: new UntypedFormControl('Content', Validators.required),
        value: new UntypedFormControl(snippet.content, Validators.required),
        computedValue: new UntypedFormControl(snippet.content, Validators.required),
      }),
      this.fb.group({
        name: new UntypedFormControl('jsScript', Validators.required),
        type: new UntypedFormControl(AttributeTypes.Text, Validators.required),
        displayName: new UntypedFormControl('jsScript', Validators.required),
        value: new UntypedFormControl(snippet.jsScript),
        computedValue: new UntypedFormControl(snippet.jsScript),
      })
    ];
  }

}
