import { Component, OnInit, Inject } from '@angular/core';
import { Validators, FormGroup, FormControl, FormArray, FormBuilder } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AttributeTypes } from '@ng-druid/attributes';
import { Pane } from 'panels';
import { Snippet } from 'snippet';
import { SnippetContentHandler } from '../../../handlers/snippet-content.handler';

@Component({
  selector: 'classifieds-ui-snippet-editor2',
  templateUrl: './snippet-editor2.component.html',
  styleUrls: ['./snippet-editor2.component.scss']
})
export class SnippetEditor2Component implements OnInit {

  snippet: Snippet;

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: { panelFormGroup: FormGroup; pane: Pane; paneIndex: number;  },
    private fb: FormBuilder,
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
      (this.data.panelFormGroup.get('panes') as FormArray).push(this.fb.group({
        contentPlugin: 'snippet',
        name: new FormControl(''),
        label: new FormControl(''),
        rule: new FormControl(''),
        settings: new FormArray(this.buildSettings(snippet))
      }));
    } else {
      const paneForm = (this.data.panelFormGroup.get('panes') as FormArray).at(this.data.paneIndex);
      (paneForm.get('settings') as FormArray).clear();
      this.buildSettings(snippet).forEach(s => {
        (paneForm.get('settings') as FormArray).push(s)
      });
    }
  }

  buildSettings(snippet: Snippet): Array<FormGroup> {
    return [
      this.fb.group({
        name: new FormControl('contentType', Validators.required),
        type: new FormControl(AttributeTypes.Text, Validators.required),
        displayName: new FormControl('Content Type', Validators.required),
        value: new FormControl(snippet.contentType, Validators.required),
        computedValue: new FormControl(snippet.contentType, Validators.required),
      }),
      this.fb.group({
        name: new FormControl('content', Validators.required),
        type: new FormControl(AttributeTypes.Text, Validators.required),
        displayName: new FormControl('Content', Validators.required),
        value: new FormControl(snippet.content, Validators.required),
        computedValue: new FormControl(snippet.content, Validators.required),
      })
    ];
  }

}
