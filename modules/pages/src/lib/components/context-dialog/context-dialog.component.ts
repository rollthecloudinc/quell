import { Component, OnInit, AfterViewInit, Inject, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ContextFormComponent } from '@classifieds-ui/context';
import { InlineContext } from '../../models/context.models';

@Component({
  selector: 'classifieds-ui-context-dialog',
  templateUrl: './context-dialog.component.html',
  styleUrls: ['./context-dialog.component.scss']
})
export class ContextDialogComponent implements OnInit, AfterViewInit  {

  contextForm = this.fb.group({
    context: this.fb.control('')
  });

  @ViewChild(ContextFormComponent) contextFormComp: ContextFormComponent;

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: { context?: InlineContext },
    private dialogRef: MatDialogRef<ContextDialogComponent>,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    if(this.data.context) {
      setTimeout(() => {
        this.contextFormComp.contextForm.setValue({ name: this.data.context.name, plugin: this.data.context.plugin });
        if(this.data.context.plugin === 'rest') {
          setTimeout(() => {
            (this.contextFormComp.componentRef.instance.restSourceFormComp as any).restSource = { url: this.data.context.rest.url, params: this.data.context.rest.params };
          });
        }
      });
    }
  }

  submit() {
    if(this.contextForm.get('context').value.name !== '') {
      this.dialogRef.close(new InlineContext(this.contextForm.get('context').value));
    } else {
      this.dialogRef.close();
    }
  }

}
