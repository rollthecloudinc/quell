import { Component, ComponentFactoryResolver, ComponentRef, OnInit, ViewChild } from '@angular/core';
import { DatasourcePluginManager } from '../../services/datasource-plugin-manager.service';
import { FormBuilder, Validators } from '@angular/forms';
import { switchMap } from 'rxjs/operators';
import { DatasourcePlugin } from '../../models/datasource.models';
import { DatasourceRendererHostDirective } from '../../directives/datasource-renderer-host.directive';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'classifieds-ui-datasource-form',
  templateUrl: './datasource-form.component.html',
  styleUrls: ['./datasource-form.component.scss']
})
export class DatasourceFormComponent implements OnInit {

  @ViewChild(DatasourceRendererHostDirective, { static: true }) datasourceHost: DatasourceRendererHostDirective;

  datasources$ = this.dpm.getPlugins();

  formGroup = this.fb.group({
    plugin: this.fb.control('', [ Validators.required ])
  });

  componentRef$ = new BehaviorSubject<ComponentRef<any>>(undefined);

  constructor(
    private fb: FormBuilder,
    private componentFactoryResolver: ComponentFactoryResolver,
    private dpm: DatasourcePluginManager
  ) { }

  ngOnInit(): void {
    this.formGroup.get('plugin').valueChanges.pipe(
      switchMap(p => this.dpm.getPlugin(p))
    ).subscribe(p => {
      this.renderPlugin(p);
    });
  }

  renderPlugin(plugin: DatasourcePlugin<string>) {
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(plugin.editor);

    const viewContainerRef = this.datasourceHost.viewContainerRef;
    viewContainerRef.clear();

    this.componentRef$.next(viewContainerRef.createComponent(componentFactory));
    // (componentRef.instance as any).settings = this.settings;
  }

}
