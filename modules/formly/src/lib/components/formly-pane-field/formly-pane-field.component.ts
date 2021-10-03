
import { Component, OnChanges, Input, SimpleChanges, forwardRef, OnInit, ComponentRef, Output, EventEmitter } from '@angular/core';
import { ControlValueAccessor,NG_VALUE_ACCESSOR, NG_VALIDATORS, FormGroup,FormControl, Validator, Validators, AbstractControl, ValidationErrors, FormArray, FormBuilder } from "@angular/forms";
import { FormlyFieldConfig } from '@ngx-formly/core';
import { AttributeSerializerService, AttributeValue } from 'attributes';
import { iif, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map, switchMap, tap } from 'rxjs/operators';
import { FormlyFieldContentHandler } from '../../handlers/formly-field-content.handler';
import { FormlyAutocompleteComponent } from '../formly-autocomplete/formly-autocomplete.component';

@Component({
  selector: 'classifieds-ui-formly-pane-field',
  templateUrl: './formly-pane-field.component.html',
  styleUrls: ['./formly-pane-field.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FormlyPaneFieldComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => FormlyPaneFieldComponent),
      multi: true
    },
  ]
})
export class FormlyPaneFieldComponent implements ControlValueAccessor, Validator, OnInit {

  @Input()
  settings: Array<AttributeValue> = [];

  @Output()
  searchChange = new EventEmitter<string>();

  settingsFormArray = this.fb.array([]);
  proxyGroup = this.fb.group({});

  bridgeSub = this.proxyGroup.valueChanges.pipe(
    debounceTime(500)
  ).subscribe(v => {
    this.settingsFormArray.clear();
    const newGroup = this.attributeSerializer.convertToGroup(this.attributeSerializer.serialize(v.value, 'value'));
    this.settingsFormArray.push(newGroup);
  });

  public onTouched: () => void = () => {};

  fields: FormlyFieldConfig[] = [];
  model: any = {};

  constructor(
    private fb: FormBuilder,
    private attributeSerializer: AttributeSerializerService,
    private handler: FormlyFieldContentHandler
  ) { }

  ngOnInit(): void {
    this.handler.buildFieldConfig(this.settings).pipe(
      map(f => ({
        ...f,
        hooks: {
          afterViewInit: (field: FormlyFieldConfig) => {
            this.formlyHookAfterViewInit(field);
          }
        }
      }))
    ).subscribe(f => {
      this.fields = [ { ...f } ];
    });

  }

  writeValue(val: any): void {
    if (val) {
      setTimeout(() => this.settingsFormArray.setValue(val, { emitEvent: false }));
    }
  }

  registerOnChange(fn: any): void {
    this.settingsFormArray.valueChanges.subscribe(fn);
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    if (isDisabled) {
      this.settingsFormArray.disable()
    } else {
      this.settingsFormArray.enable()
    }
  }

  validate(c: AbstractControl): ValidationErrors | null{
    return null; //this.attributesForm.valid ? null : { invalidForm: {valid: false, message: "attributes are invalid"}};
  }
s
  formlyHookAfterViewInit(field: FormlyFieldConfig) {
    if (field.type === 'autocomplete') {
      const target: ComponentRef<FormlyAutocompleteComponent> = (field as any)._componentRefs.find(ref => ref.instance instanceof FormlyAutocompleteComponent);
      target.instance.formControl.valueChanges.pipe(
        debounceTime(1000),
        distinctUntilChanged(),
        tap(s => this.searchChange.emit(s))
      ).subscribe();
    }
  }

}
