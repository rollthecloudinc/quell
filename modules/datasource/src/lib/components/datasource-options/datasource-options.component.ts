import { Component, forwardRef, Input, OnChanges, SimpleChanges } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { DatasourceOptions } from '../../models/datasource.models';
import { Fillable } from '@rollthecloudinc/utils';

@Component({
  selector: 'classifieds-ui-datasource-options',
  templateUrl: './datasource-options.component.html',
  standalone: false,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DatasourceOptionsComponent),
      multi: true
    }
  ]
})
export class DatasourceOptionsComponent implements ControlValueAccessor, OnChanges, Fillable {
  @Input() datasourceOptions: DatasourceOptions;

  formGroup: UntypedFormGroup;
  protected fillContent: any

  private onChange: (val: DatasourceOptions) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private fb: UntypedFormBuilder) {
    this.formGroup = this.fb.group({
      query: [''],
      trackBy: [''],
      valueMapping: [''],
      labelMapping: [''],
      idMapping: [''],
      multiple: [''],
      limit: ['']
    });

    // Emit form changes back to the parent
    this.formGroup.valueChanges.subscribe(value => {
      this.onChange(value); // Propagate new form value to parent
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['datasourceOptions'] && changes['datasourceOptions'].currentValue) {
      this.formGroup.patchValue(this.datasourceOptions, { emitEvent: false });
    }
  }

  writeValue(value: DatasourceOptions): void {
    console.log("Datasource Options Write Value", value);
    if (value) {
      this.formGroup.patchValue(value, { emitEvent: false });
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    if (isDisabled) {
      this.formGroup.disable();
    } else {
      this.formGroup.enable();
    }
  }

  setFillContent(content: any) {
    this.fillContent = content
  }

  fill() {
    if (this.fillContent) {
      const query = this.fillContent.query
      const trackBy = this.fillContent.trackBy
      const valueMapping = this.fillContent.valueMapping
      const labelMapping = this.fillContent.labelMapping
      const idMapping = this.fillContent.idMapping
      const multiple = this.fillContent.multiple
      const limit = this.fillContent.limit
      this.formGroup.patchValue({
        query,
        trackBy,
        valueMapping,
        labelMapping,
        idMapping,
        multiple,
        limit
      })
    }
  }
}