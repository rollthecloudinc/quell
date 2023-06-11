import { Component, OnInit, ViewChild, ComponentFactoryResolver, forwardRef, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NG_VALIDATORS, UntypedFormBuilder, Validator, Validators, AbstractControl, ValidationErrors } from "@angular/forms";
import { ContextPlugin, InlineContext } from '../../models/context.models';
import { ContextEditorHostDirective } from '../../directives/context-editor-host.directive';
import { ContextPluginManager } from '../../services/context-plugin-manager.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter, map, switchMap } from 'rxjs/operators';
@Component({
  selector: 'classifieds-ui-context-form',
  templateUrl: './context-form.component.html',
  styleUrls: ['./context-form.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ContextFormComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => ContextFormComponent),
      multi: true
    },
  ]
})
export class ContextFormComponent implements OnInit, ControlValueAccessor, Validator {

  @Input()
  set context(context: InlineContext) {
    this.context$.next(context);
  }

  contextPlugins: Observable<Map<string, ContextPlugin<string>>>;

  componentRef: any;

  contextForm = this.fb.group({
    name: this.fb.control('', Validators.required),
    plugin: this.fb.control('', Validators.required)
  });

  context$ = new BehaviorSubject<InlineContext>(undefined);

  public onTouched: () => void = () => {};

  @ViewChild(ContextEditorHostDirective, { static: true }) editorHost: ContextEditorHostDirective;

  constructor(
    private fb: UntypedFormBuilder,
    private componentFactoryResolver: ComponentFactoryResolver,
    private cpm: ContextPluginManager
  ) { }

  ngOnInit(): void {
    // this.contextPlugins = this.contextManager.getAll(false);
    this.contextPlugins = this.cpm.getPlugins().pipe(
      map(plugins => new Map<string, ContextPlugin<string>>(Array.from(plugins).filter(([_, p], __) => !p.internal).map(([_, p], __) => [ p.name, p ])))
    );
    this.contextForm.get('plugin').valueChanges.pipe(
      switchMap(v => this.cpm.getPlugin(v))
    ).subscribe(plugin => {
      if(plugin.editorComponent) {
        this.renderEditor(plugin);
      } else {
        this.editorHost.viewContainerRef.clear();
      }
    });
    this.context$.pipe(
      filter(() => !!this.componentRef)
    ).subscribe(c => {
      (this.componentRef.instance as any).context = c;
    });
  }

  writeValue(val: any): void {
    if (val) {
      this.contextForm.setValue(val, { emitEvent: false });
    }
  }

  registerOnChange(fn: any): void {
    this.contextForm.valueChanges.subscribe(fn);
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    if (isDisabled) {
      this.contextForm.disable()
    } else {
      this.contextForm.enable()
    }
  }

  validate(c: AbstractControl): ValidationErrors | null{ 
    return this.contextForm.valid ? null : { invalidForm: {valid: false, message: "context is invalid"}};
  }

  renderEditor(plugin: ContextPlugin) {
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(plugin.editorComponent);

    const viewContainerRef = this.editorHost.viewContainerRef;
    viewContainerRef.clear();

    this.componentRef = viewContainerRef.createComponent(componentFactory);
    (this.componentRef.instance as any).context = this.context$.value;
  }

}
