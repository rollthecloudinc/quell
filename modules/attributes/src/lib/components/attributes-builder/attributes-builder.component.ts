
import { Component, OnChanges, Input, SimpleChanges, forwardRef } from '@angular/core';
import { ControlValueAccessor,NG_VALUE_ACCESSOR, NG_VALIDATORS, UntypedFormGroup,UntypedFormControl, Validator, Validators, AbstractControl, ValidationErrors, UntypedFormArray } from "@angular/forms";
import { Attribute, AttributeWidget, AttributeValue } from '../../models/attributes.models';
import { WidgetsService } from '../../services/widgets.service';
import { Observable } from 'rxjs';
import { WidgetPluginManager } from '../../services/widget-plugin-manager.service';
@Component({
    selector: 'classifieds-ui-attributes-builder',
    templateUrl: './attributes-builder.component.html',
    styleUrls: ['./attributes-builder.component.scss'],
    providers: [
        WidgetsService,
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => AttributesBuilderComponent),
            multi: true
        },
        {
            provide: NG_VALIDATORS,
            useExisting: forwardRef(() => AttributesBuilderComponent),
            multi: true
        },
    ],
    standalone: false
})
export class AttributesBuilderComponent implements OnChanges, ControlValueAccessor, Validator {

  @Input()
  attributes: Array<Attribute> = [];

  @Input()
  appearance = 'legacy';

  @Input()
  set attributeValues(attributeValues: Array<AttributeValue> | undefined) {
    this._attributeValues = attributeValues;
    this.applyValues();
  }
  get attributeValues() {
    return this._attributeValues;
  }

  attributesForm = new UntypedFormGroup({
    attributes: new UntypedFormArray([])
  });

  get attributesArray(): UntypedFormArray {
    return this.attributesForm.get('attributes') as UntypedFormArray;
  }

  private _attributeValues: Array<AttributeValue> = [];

  constructor(
    private widgetsService: WidgetsService,
    private wpm: WidgetPluginManager
  ) { }

  public onTouched: () => void = () => {};

  ngOnChanges(changes: SimpleChanges) {
    if (changes.attributes && (!changes.attributes.previousValue || changes.attributes.previousValue !== changes.attributes.currentValue)) {
      while (this.attributesArray.length !== 0) {
        this.attributesArray.removeAt(0);
      }
      // @todo: Supports 2 levels of nesting currently (no recursion).
      this.attributes.forEach(attr => {
        this.attributesArray.push(new UntypedFormGroup({
          name: new UntypedFormControl(attr.name, Validators.required),
          type: new UntypedFormControl(attr.type, Validators.required),
          displayName: new UntypedFormControl(attr.label, Validators.required),
          value: new UntypedFormControl('', attr.required ? Validators.required : []),
          attributes: new UntypedFormArray(!attr.attributes ? [] : attr.attributes.map(attr2 => new UntypedFormGroup({
            name: new UntypedFormControl(attr2.name, Validators.required),
            type: new UntypedFormControl(attr2.type, Validators.required),
            displayName: new UntypedFormControl(attr2.label, Validators.required),
            value: new UntypedFormControl('', attr2.required ? Validators.required : [])
          })))
        }));
      });

      this.applyValues();
    }
  }

  writeValue(val: any): void {
    if (val) {
      console.log(`write value: ${val}`);
      this.attributesArray.setValue(val, { emitEvent: false });
    }
  }

  registerOnChange(fn: any): void {
    this.attributesArray.valueChanges.subscribe(fn);
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    if (isDisabled) {
      this.attributesArray.disable()
    } else {
      this.attributesArray.enable()
    }
  }

  validate(c: AbstractControl): ValidationErrors | null{
    return this.attributesForm.valid ? null : { invalidForm: {valid: false, message: "attributes are invalid"}};
  }

  discoverWidget(widget: string): Observable<AttributeWidget<string>> {
    // return this.widgetsService.get(widget);
    return this.wpm.getPlugin(widget);
  }

  applyValues() {
    this.attributesArray.controls.forEach((c, index) => {
      const attrValue = this.attributeValues ? this.attributeValues.find(av => av.name === c.get('name').value) : undefined;
      if(attrValue !== undefined) {
        c.get('value').setValue(attrValue.value);
        c.updateValueAndValidity();
      }
      (c.get('attributes') as UntypedFormArray).controls.forEach(c => {
        const attrValue = this.attributeValues && this.attributeValues[index] !== undefined ? this.attributeValues[index].attributes.find(av => av.name === c.get('name').value) : undefined;
        if(attrValue !== undefined) {
          c.get('value').setValue(attrValue.value);
          c.updateValueAndValidity();
        }
      });
    });
  }
}
