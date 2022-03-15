import { Component, OnInit, forwardRef, Output, EventEmitter, OnDestroy, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NG_VALIDATORS, FormBuilder, Validator, Validators, AbstractControl, ValidationErrors } from "@angular/forms";
import { HttpErrorResponse } from '@angular/common/http';
import { Subject, of, BehaviorSubject } from 'rxjs';
import { debounceTime, filter, map, switchMap, catchError, tap, takeUntil } from 'rxjs/operators';
import { DatasourceApiService } from '@ng-druid/datasource';
import * as qs from 'qs';
import { TokenizerService } from '@ng-druid/token';
import { Rest } from '../../models/rest.models';

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
  set restSource(restSource: Rest) {
    this.restSource$.next(restSource);
  };

  @Input()
  contexts: Array<string> = [];

  sourceForm = this.fb.group({
    url: this.fb.control('', Validators.required),
    params: this.fb.control([]),
    body: this.fb.control(''),
    method: this.fb.control('get', [ Validators.required ])
  });

  jsonData: Array<any>;
  tokens: Map<string, any>;
  paramsParsed: any;

  readonly restSource$ = new BehaviorSubject<Rest>(new Rest());

  componentDestroyed = new Subject();

  refreshData$ = new Subject();
  refreshSubscription = this.refreshData$.pipe(
    map(() => this.generateUrl()),
    tap(url => console.log(url)),
    filter(url => url && url.trim() !== ''),
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

  private readonly urlChangeSub = this.sourceForm.get('url').valueChanges.pipe(
    debounceTime(500),
    filter(url => url && url.trim() !== ''),
    map(url => [url, url.indexOf('?')]),
    map(([url, index]) => [(index > -1 ? url.substring(0, index) : url), (index > -1 ? url.substring(index + 1) : '')])
  ).subscribe(([path, queryString]) => {
    const pathParsed = (path as string).split('/').reduce<any>((p, c, i) => (c.indexOf(':') === 0 ? { ...p, [c.substr(1)]: c } : p ), {});
    const parsed = { ...(pathParsed as any), ...qs.parse(queryString) };
    this.paramsParsed = parsed;
  });

  private readonly restSourceSub = this.restSource$.pipe(
    tap(r => {
      if (r) {
        this.sourceForm.get('url').setValue(r.url);
        this.sourceForm.get('method').setValue(r.method ? r.method : '');
        this.sourceForm.get('body').setValue(r.body ? { ...r.body, jsScript: '' } : '');
      } else {
        this.sourceForm.get('url').setValue('');
        this.sourceForm.get('method').setValue('');
        this.sourceForm.get('body').setValue('');
      }
    })
  ).subscribe();

  public onTouched: () => void = () => {};

  constructor(
    private fb: FormBuilder, 
    private datasourceApi: DatasourceApiService,
    private tokenizerService: TokenizerService
  ) {
  }

  ngOnInit(): void {
    this.sourceForm.valueChanges.pipe(
      debounceTime(1000)
    ).subscribe(() => {
      console.log('refresh data')
      this.refreshData$.next(undefined);
    });
  }

  ngOnDestroy() {
    this.componentDestroyed.next(undefined);
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

  /*refreshData() {

  }*/

  generateUrl(): string {
    console.log('generate url');
    const url = this.sourceForm.get('url').value;
    const [path, queryString] = url ? url.split('?', 2) : ['',''];
    const qsParsed = qs.parse(queryString);
    const qsOverrides = {};
    const pathPieces = path.split('/');
    const len = pathPieces.length;
    const rebuildUrl = [];
    let pathParams = 0;
    for(let i = 0; i < len; i++) {
      if(pathPieces[i].indexOf(':') === 0) {
        if(!this.sourceForm.get('params').value[pathParams]) {
          return '';
        }
        const mapping = this.sourceForm.get('params').value[pathParams].mapping;
        rebuildUrl.push(mapping.value.type === 'static' ? mapping.value.value : mapping.value.testValue);
        pathParams++;
      } else {
        rebuildUrl.push(pathPieces[i]);
      }
    }
    for(const prop in qsParsed) {
      if(typeof(qsParsed[prop]) === 'string' && (qsParsed[prop] as string).indexOf(':') > -1) {
        if(!this.sourceForm.get('params').value[pathParams]) {
          return '';
        }
        const mapping = this.sourceForm.get('params').value[pathParams].mapping;
        qsOverrides[prop] = mapping.type === 'static' ? mapping.value : mapping.testValue;
        pathParams++;
      }
    }
    const apiUrl = rebuildUrl.join('/') + (queryString !== '' ? '?' + qs.stringify({ ...qsParsed, ...qsOverrides }) : '');
    console.log(apiUrl);
    return apiUrl;
  }

  onDataChange(data: any) {
    this.tokens = this.tokenizerService.generateGenericTokens(data[0]);
  }

}
