import { Component, OnInit, Inject } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { 
  QueryBuilderConfig, 
  FieldMap, 
  Rule as NgRule, 
  RuleSet as NgRuleSet 
} from '@rollthecloudinc/ngx-angular-query-builder';

import { InlineContext, InlineContextResolverService } from '@rollthecloudinc/context';
import { RulesParserService } from '@rollthecloudinc/rules';

import { SelectionFormPayload } from '@rollthecloudinc/panels';

@Component({
  selector: 'classifieds-ui-selection-dialog',
  templateUrl: './selection-dialog.component.html',
  styleUrls: ['./selection-dialog.component.scss'],
  standalone: false
})
export class SelectionDialogComponent implements OnInit {

  selectionForm = this.fb.group({
    priority: this.fb.control(this.data.selection.priority || 0),
    rule: this.fb.control(null as NgRuleSet | null)
  });

  config: QueryBuilderConfig = {
    fields: {}
  };

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { selection: SelectionFormPayload, contexts: Array<InlineContext> },
    private dialogRef: MatDialogRef<SelectionDialogComponent>,
    private fb: UntypedFormBuilder,
    private inlineContextResolver: InlineContextResolverService,
    private rulesParser: RulesParserService
  ) {}

  ngOnInit(): void {

    this.inlineContextResolver.resolveMerged(this.data.contexts).subscribe(resolved => {

      const fieldMap: FieldMap = {};

      // Build query fields from resolved contexts
      for (const ctxName in resolved) {
        this.rulesParser.buildFields(resolved[ctxName], ctxName)
          .forEach((field, key) => fieldMap[key] = field);
      }

      this.config = { ...this.config, fields: fieldMap };

      // SAFELY load rule only after config is ready
      const incomingRule = this.data.selection.rule;
      if (incomingRule && this.isRuleSetValid(incomingRule, fieldMap)) {
        // this.selectionForm.get('rule')?.setValue(incomingRule);
        this.selectionForm.get('rule')?.setValue(structuredClone(incomingRule));
      } else {
        if (incomingRule) {
          console.warn('Selection rule contains unknown fields — skipping load');
        }
      }
    });
  }

  // Validate a full RuleSet recursively
  private isRuleSetValid(node: NgRuleSet, fieldMap: FieldMap): boolean {
    if (!node || !node.rules) return false;

    return node.rules.every(r => {
      // Leaf (Rule)
      if (this.isNgRule(r)) {
        return !!fieldMap[r.field];
      }
      // Nested rule group
      if (this.isNgRuleSet(r)) {
        return this.isRuleSetValid(r, fieldMap);
      }
      return false;
    });
  }

  // Type guard for Rule
  private isNgRule(obj: any): obj is NgRule {
    return obj && typeof obj.field === 'string';
  }

  // Type guard for RuleSet
  private isNgRuleSet(obj: any): obj is NgRuleSet {
    return obj && Array.isArray(obj.rules);
  }

  submit() {
    const value = this.selectionForm.value;

    const payload = new SelectionFormPayload({
      priority: value.priority,
      rule: value.rule || undefined
    });

    this.dialogRef.close(payload);
  }
}