import { Component, OnInit, Output, EventEmitter, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NG_VALIDATORS, FormBuilder, Validator, Validators, AbstractControl, ValidationErrors, FormArray } from "@angular/forms";
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { Snippet } from '../../models/plugin.models';

@Component({
  selector: 'classifieds-ui-snippet-form',
  templateUrl: './snippet-form.component.html',
  styleUrls: ['./snippet-form.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SnippetFormComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => SnippetFormComponent),
      multi: true
    },
  ]
})
export class SnippetFormComponent implements OnInit, ControlValueAccessor, Validator {

  @Output()
  submitted = new EventEmitter<Snippet>();

  @Input()
  tokens: Map<string, any>;

  @Input()
  splitDirection = 'vertical';

  @Input()
  rows = 40;

  @Input()
  cols = 100;

  @Input()
  rootForm = true;

  @Input()
  set snippet(snippet: Snippet) {
    if(snippet !== undefined) {
      this.contentForm.setValue(snippet);
    }
  }

  public onTouched: () => void = () => {};

  contentForm = this.fb.group({
    content: this.fb.control('', Validators.required),
    contentType: this.fb.control('', Validators.required)
  });

  preview: string;
  isMarkdown = false;

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.contentForm.get("content").valueChanges.pipe(
      distinctUntilChanged(),
      debounceTime(500),
      map(v => this.tokens !== undefined ? this.replaceTokens(v) : v)
    ).subscribe(v => {
      this.preview = v;
    });
    this.contentForm.get("contentType").valueChanges.subscribe(v => {
      this.isMarkdown = v === 'text/markdown'
    });
  }

  writeValue(val: any): void {
    if (val) {
      console.log(`write value: ${val}`);
      this.contentForm.setValue(val, { emitEvent: false });
    }
  }

  registerOnChange(fn: any): void {
    this.contentForm.valueChanges.subscribe(fn);
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    if (isDisabled) {
      this.contentForm.disable()
    } else {
      this.contentForm.enable()
    }
  }

  validate(c: AbstractControl): ValidationErrors | null{
    return this.contentForm.valid ? null : { invalidForm: {valid: false, message: "snippet is invalid"}};
  }

  submit() {
    this.submitted.emit(new Snippet({
      content: this.contentForm.get('content').value,
      contentType: this.contentForm.get('contentType').value,
    }));
  }

  replaceTokens(v: string): string {
    if(this.tokens) {
      this.tokens.forEach((value, key) => {
        v = v.replace(`[${key}]`, `${value} [token = '${key}']`);
      });
    }
    return v;
  }

}
