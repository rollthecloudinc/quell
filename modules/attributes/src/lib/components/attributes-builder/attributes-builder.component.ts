
import { Component, OnChanges, Input, SimpleChanges, forwardRef } from '@angular/core';
import { ControlValueAccessor,NG_VALUE_ACCESSOR, NG_VALIDATORS, FormGroup,FormControl, Validator, Validators, AbstractControl, ValidationErrors, FormArray } from "@angular/forms";
import { Attribute, AttributeWidget, AttributeValue } from '../../models/attributes.models';
import { WidgetsService } from '../../services/widgets.service';

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
  ]
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

  attributesForm = new FormGroup({
    attributes: new FormArray([])
  });

  get attributesArray(): FormArray {
    return this.attributesForm.get('attributes') as FormArray;
  }

  private _attributeValues: Array<AttributeValue> = [];

  constructor(private widgetsService: WidgetsService) { }

  public onTouched: () => void = () => {};

  ngOnChanges(changes: SimpleChanges) {
    if (changes.attributes.previousValue !== changes.attributes.currentValue) {
      while (this.attributesArray.length !== 0) {
        this.attributesArray.removeAt(0);
      }
      // @todo: Supports 2 levels of nesting currently (no recursion).
      this.attributes.forEach(attr => {
        this.attributesArray.push(new FormGroup({
          name: new FormControl(attr.name, Validators.required),
          type: new FormControl(attr.type, Validators.required),
          displayName: new FormControl(attr.label, Validators.required),
          value: new FormControl('', attr.required ? Validators.required : []),
          attributes: new FormArray(!attr.attributes ? [] : attr.attributes.map(attr2 => new FormGroup({
            name: new FormControl(attr2.name, Validators.required),
            type: new FormControl(attr2.type, Validators.required),
            displayName: new FormControl(attr2.label, Validators.required),
            value: new FormControl('', attr2.required ? Validators.required : [])
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

  discoverWidget(widget: string): AttributeWidget {
    return this.widgetsService.get(widget);
  }

  applyValues() {
    this.attributesArray.controls.forEach((c, index) => {
      const attrValue = this.attributeValues ? this.attributeValues.find(av => av.name === c.get('name').value) : undefined;
      if(attrValue !== undefined) {
        c.get('value').setValue(attrValue.value);
        c.updateValueAndValidity();
      }
      (c.get('attributes') as FormArray).controls.forEach(c => {
        const attrValue = this.attributeValues && this.attributeValues[index] !== undefined ? this.attributeValues[index].attributes.find(av => av.name === c.get('name').value) : undefined;
        if(attrValue !== undefined) {
          c.get('value').setValue(attrValue.value);
          c.updateValueAndValidity();
        }
      });
    });
  }
}
