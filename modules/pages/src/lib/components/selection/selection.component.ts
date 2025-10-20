import { Component, OnInit, Input, forwardRef, Output, EventEmitter } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NG_VALIDATORS, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validator, Validators, AbstractControl, ValidationErrors, UntypedFormArray, ControlContainer } from "@angular/forms";
import { AttributeTypes, AttributeSerializerService, AttributeValue } from '@rollthecloudinc/attributes';
import { TokenizerService } from '@rollthecloudinc/token';
import { SelectOption, SelectMapping } from '@rollthecloudinc/datasource';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
    selector: 'classifieds-ui-selection',
    templateUrl: './selection.component.html',
    styleUrls: ['./selection.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => SelectionComponent),
            multi: true
        },
        {
            provide: NG_VALIDATORS,
            useExisting: forwardRef(() => SelectionComponent),
            multi: true
        },
    ],
    standalone: false
})
export class SelectionComponent implements OnInit, ControlValueAccessor, Validator {

  @Output()
  searchChange = new EventEmitter<string>();

  @Input()
  name: string;

  @Input()
  label: string;

  @Input()
  set values(values: Array<SelectOption>) {
    this.options = values;
    this.buildOptions();
  }

  @Input()
  renderType: string;

  @Input()
  selectMapping: SelectMapping;

  selectionForm = this.fb.group({
    attributes: this.fb.array([])
  });

  options: Array<SelectOption>;

  displayAuto: (opt: SelectOption) => string;

  public onTouched: () => void = () => {};

  get attributesArray(): UntypedFormArray {
    return this.selectionForm.get('attributes') as UntypedFormArray;
  }

  constructor(private fb: UntypedFormBuilder, private attributeSerializer: AttributeSerializerService, private tokenizerService: TokenizerService) {
    this.displayAuto = (opt: SelectOption): string => {
      return tokenizerService.replaceTokens(this.selectMapping.label, this.tokenizerService.generateGenericTokens(opt.dataItem));
    };
  }

  ngOnInit(): void {
    this.attributesArray.push(this.fb.group({
      name: new UntypedFormControl('value', Validators.required),
      type: new UntypedFormControl(AttributeTypes.Array, Validators.required),
      displayName: new UntypedFormControl('Value', Validators.required),
      value: new UntypedFormControl(''),
      attributes: ['checkboxgroup'].findIndex(r => r === this.renderType) > -1 ? this.fb.array([]) : new UntypedFormControl('')
    }));
    if(this.renderType === 'autocomplete') {
      (this.attributesArray.at(0) as UntypedFormGroup).addControl('_proxy', this.fb.control(''));
      this.attributesArray.at(0).get('_proxy').valueChanges.pipe(
        distinctUntilChanged(),
        debounceTime(500),
      ).subscribe(v => {
        this.searchChange.emit(v);
      });
    }
  }

  onOptionSelected(evt) {
    this.attributesArray.at(0).get('attributes').setValue(evt.option.value.value);
    this.attributesArray.at(0).get('attributes').updateValueAndValidity();
  }

  writeValue(val: any): void {
    if (val) {
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
    return this.selectionForm.valid ? null : { invalidForm: {valid: false, message: "selection is invalid"}};
  }

  buildOptions() {
    if(this.renderType === 'checkboxgroup' && this.options !== undefined) {
      const formArray = (this.attributesArray.controls[0].get('attributes') as UntypedFormArray);
      formArray.clear();
      this.options.forEach(option => {
        const group = this.attributeSerializer.convertToGroup(option.value);
        group.addControl('_store', new UntypedFormControl(false));
        formArray.push(group);
      });
    }
  }

}
