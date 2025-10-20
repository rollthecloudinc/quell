import { Component, OnInit, Inject } from '@angular/core';
import { UntypedFormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { QueryBuilderConfig, FieldMap, Rule as NgRule } from 'ngx-angular-query-builder';
import { InlineContext, InlineContextResolverService } from '@rollthecloudinc/context';
import { RulesParserService } from '@rollthecloudinc/rules';
import { forkJoin } from 'rxjs';
import { map, tap, defaultIfEmpty } from 'rxjs/operators';

@Component({
    selector: 'classifieds-ui-rules-dialog',
    templateUrl: './rules-dialog.component.html',
    styleUrls: ['./rules-dialog.component.scss'],
    standalone: false
})
export class RulesDialogComponent implements OnInit {

  rulesForm = this.fb.group({
    rules: this.fb.control('')
  });

  config: QueryBuilderConfig = {
    fields: {
      /*age: {name: 'Age', type: 'number'},
      gender: {
        name: 'Gender',
        type: 'category',
        options: [
          {name: 'Male', value: 'm'},
          {name: 'Female', value: 'f'}
        ]
      }*/
    }
  }

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: { rule: undefined | NgRule,contexts: Array<InlineContext> },
    private dialogRef: MatDialogRef<RulesDialogComponent>,
    private fb: UntypedFormBuilder,
    private inlineContextResolver: InlineContextResolverService,
    private rulesParser:  RulesParserService
  ) { }

  ngOnInit(): void {
    this.inlineContextResolver.resolveMerged(this.data.contexts).subscribe(res => {
      const fieldMap: FieldMap = {}
      for(const name in res) {
        this.rulesParser.buildFields(res[name], name).forEach((f, k) => {
          fieldMap[k] = f;
        });
      }
      this.config = { ...this.config, fields: fieldMap };
      if(this.data.rule !== undefined) {
        this.rulesForm.get('rules').setValue(this.data.rule);
      }
    })
  }

  submit() {
    console.log('the rules');
    console.log(this.rulesForm.get('rules').value);
    this.dialogRef.close(this.rulesForm.get('rules').value);
  }

}
