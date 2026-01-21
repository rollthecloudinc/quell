import { Component, OnInit, Inject } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AttributeSerializerService } from '@rollthecloudinc/attributes';
import { Datasource } from '@rollthecloudinc/datasource';
import { PrerenderFormPayload } from '@rollthecloudinc/panels';
import { map, tap } from 'rxjs/operators';

@Component({
    selector: 'classifieds-ui-prerender-dialog',
    templateUrl: './prerender-dialog.component.html',
    styleUrls: ['./prerender-dialog.component.scss'],
    standalone: false
})
export class PrerenderDialogComponent implements OnInit {

  datasource: Datasource;

  prerenderForm = this.fb.group({
    route: this.fb.control(this.data.props.route),
    datasource: this.fb.control(this.data.props.datasource),
    _proxy: this.fb.control('')
  });

  readonly proxyControlSub = this.prerenderForm.get('_proxy').valueChanges.pipe(
    map(v => v ? new Datasource({ ...v, settings: this.attributeSerializer.serialize(v.settings, 'settings').attributes }) : new Datasource()),
    tap(ds => this.prerenderForm.get('datasource').setValue(ds))
  ).subscribe();

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: { props: PrerenderFormPayload },
    private dialogRef: MatDialogRef<PrerenderDialogComponent>,
    private fb: UntypedFormBuilder,
    private attributeSerializer: AttributeSerializerService
  ) { 
    this.datasource = this.data.props.datasource;
  }

  ngOnInit(): void {
  }

  submit() {
    // console.log('prerender form submit', { ...this.prerenderForm.value });
    this.dialogRef.close(new PrerenderFormPayload({ ...this.prerenderForm.value }));
  }

}
