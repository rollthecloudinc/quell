import { Component, OnInit, forwardRef, Output, EventEmitter, OnDestroy, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NG_VALIDATORS, FormBuilder, Validator, Validators, AbstractControl, ValidationErrors, FormArray } from "@angular/forms";
import { HttpErrorResponse } from '@angular/common/http';
import { Param } from 'durl';
import { InlineContext } from 'context';
import { NEVER, Subject, Subscription, of } from 'rxjs';
import { debounceTime, filter, map, switchMap, catchError, tap, takeUntil } from 'rxjs/operators';
import { DatasourceApiService } from 'datasource';
import * as qs from 'qs';

@Component({
  selector: 'classifieds-ui-rest-source-form',
  templateUrl: './rest-source-form.component.html',
  styleUrls: ['./rest-source-form.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RestSourceFormComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => RestSourceFormComponent),
      multi: true
    },
  ]
})
export class RestSourceFormComponent implements OnInit, OnDestroy, ControlValueAccessor, Validator {

  @Output()
  dataChange = new EventEmitter<any>();

  @Input()
  set restSource(restSource: { url: string; params: Array<Param> }) {
    if(restSource !== undefined) {
      this.sourceForm.get('url').setValue(restSource.url);
      setTimeout(() => this.sourceForm.get('params').setValue(restSource.params), 500);
    }
  };

  @Input()
  contexts: Array<InlineContext> = [];

  flags = new Map<string, string>();

  sourceForm = this.fb.group({
    url: this.fb.control('', Validators.required),
    params: this.fb.array([]),
  });

  jsonData: Array<any>;

  componentDestroyed = new Subject();

  refreshData$ = new Subject();
  refreshSubscription = this.refreshData$.pipe(
    map(() => this.generateUrl()),
    tap(url => console.log(url)),
    switchMap((url: string) => this.datasourceApi.getData(url).pipe(
      catchError((e: HttpErrorResponse) => {
        console.log(e);
        return of([]);
      })
    )),
    takeUntil(this.componentDestroyed)
  ).subscribe(data => {
    this.jsonData = data;
    this.dataChange.emit(data);
  });

  private paramsMap = new Map<string, number>()

  public onTouched: () => void = () => {};

  get params(): FormArray {
    return this.sourceForm.get('params') as FormArray;
  }

  get flagsAsArray(): Array<string> {
    const flags = [];
    this.flags.forEach((f, k) => {
      flags.push(k);
    });
    return flags;
  }

  constructor(private fb: FormBuilder, private datasourceApi: DatasourceApiService,) {
    this.flags.set('page', 'Page');
    this.flags.set('limit', 'Limit');
    this.flags.set('offset', 'Offset');
    this.flags.set('searchString', 'Search String');
  }

  ngOnInit(): void {
    this.sourceForm.get('url').valueChanges.pipe(
      debounceTime(500),
      map(url => [url, url.indexOf('?')]),
      map(([url, index]) => [(index > -1 ? url.substring(0, index) : url), (index > -1 ? url.substring(index + 1) : '')])
      // map(([path, queryString]) => [path.indexOf('/'), path, queryString])
    ).subscribe(([path, queryString]) => {
      console.log(path);
      console.log((path as string).split('/'));
      const pathParsed = (path as string).split('/').reduce<any>((p, c, i) => (c.indexOf(':') === 0 ? { ...p, [c.substr(1)]: c } : p ), {});
      const parsed = { ...(pathParsed as any), ...qs.parse(queryString) };
      console.log(parsed);
      const savedParams = this.params.value;
      console.log(savedParams);
      this.params.clear();
      let index = 0;
      const paramMapCopy = new Map<string, number>([ ...this.paramsMap ]);
      this.paramsMap = new Map<string, number>();
      for(const param in parsed) {
        if(Array.isArray(parsed[param])) {
          parsed[param].forEach(p => this.buildParams(p, index, paramMapCopy, savedParams));
          index++;
        } else if(parsed[param].indexOf(':') === 0) {
          this.buildParams(parsed[param], index, paramMapCopy, savedParams);
          index++;
        }
      }
    });
    this.sourceForm.valueChanges.pipe(
      debounceTime(1000)
    ).subscribe(() => {
      console.log('refresh data')
      this.refreshData$.next();
    });
  }

  ngOnDestroy() {
    this.componentDestroyed.next();
    this.componentDestroyed.complete();
  }

  writeValue(val: any): void {
    if (val) {
      this.sourceForm.setValue(val, { emitEvent: false });
    }
  }

  registerOnChange(fn: any): void {
    this.sourceForm.valueChanges.subscribe(fn);
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    if (isDisabled) {
      this.sourceForm.disable()
    } else {
      this.sourceForm.enable()
    }
  }

  validate(c: AbstractControl): ValidationErrors | null{
    return this.sourceForm.valid ? null : { invalidForm: {valid: false, message: "source is invalid"}};
  }

  buildParams(param: string, index: number, paramMapCopy: Map<string, number>, savedParams: any) {
    console.log(`build param ${param}`);
    this.paramsMap.set(param, index);
    this.params.push(this.fb.group({
      mapping: this.fb.group({
        type: this.fb.control('', Validators.required),
        value: this.fb.control('', Validators.required),
        testValue: this.fb.control(''),
        context: this.fb.control('')
      }),
      flags: this.fb.array(this.flagsAsArray.map(k => this.fb.group({
        name: k,
        enabled: this.fb.control(false)
      })))
    }));
    if(paramMapCopy.has(param) && paramMapCopy.get(param) === index) {
      this.params.at(index).setValue(savedParams[index]);
    }
  }

  paramName(index: number) {
    const url = this.sourceForm.get('url').value;
    const indexPos = url.indexOf('?');
    const pathParsed = ((indexPos > -1 ? url.substring(0, indexPos) : url) as string).split('/').reduce<any>((p, c, i) => (c.indexOf(':') === 0 ? { ...p, [c.substr(1)]: c } : p ), {});
    const parsed = { ...pathParsed, ...qs.parse(url.substring(url.indexOf('?') + 1)) };
    let i = 0;
    for(const param in parsed) {
      if(Array.isArray(parsed[param])) {
        for(let j = 0; j < parsed[param].length; j++) {
          if(index === i) {
            return parsed[param][j];
          }
          i++;
        }
      } else if(parsed[param].indexOf(':') === 0) {
        if(i === index) {
          return parsed[param];
        }
        i++;
      }
    }
  }

  refreshData() {

  }

  generateUrl(): string {
    console.log('generate url');
    const url = this.sourceForm.get('url').value;
    const [path, queryString] = url.split('?', 2);
    const qsParsed = qs.parse(queryString);
    const qsOverrides = {};
    const pathPieces = path.split('/');
    const len = pathPieces.length;
    const rebuildUrl = [];
    let pathParams = 0;
    for(let i = 0; i < len; i++) {
      if(pathPieces[i].indexOf(':') === 0) {
        if(!this.params.at(pathParams)) {
          return '';
        }
        const mapping = this.params.at(pathParams).get('mapping');
        rebuildUrl.push(mapping.value.type === 'static' ? mapping.value.value : mapping.value.testValue);
        pathParams++;
      } else {
        rebuildUrl.push(pathPieces[i]);
      }
    }
    for(const prop in qsParsed) {
      if(qsParsed[prop].indexOf(':') > -1) {
        if(!this.params.at(pathParams)) {
          return '';
        }
        const mapping = this.params.at(pathParams).get('mapping');
        qsOverrides[prop] = mapping.value.type === 'static' ? mapping.value.value : mapping.value.testValue;
        pathParams++;
      }
    }
    const apiUrl = rebuildUrl.join('/') + (queryString !== '' ? '?' + qs.stringify({ ...qsParsed, ...qsOverrides }) : '');
    console.log(apiUrl);
    return apiUrl;
  }

}
