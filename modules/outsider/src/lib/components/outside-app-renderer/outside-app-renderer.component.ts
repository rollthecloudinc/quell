import * as nf from "@angular-architects/native-federation";
import { Component, Input, Type, ViewChild, ViewContainerRef } from "@angular/core";
// import { ControlContainer } from "@angular/forms";
import { AttributeSerializerService, AttributeValue } from '@rollthecloudinc/attributes';
import { InlineContext } from '@rollthecloudinc/context';
import { MfeReactComponent } from "@rollthecloudinc/react"; // this will need to be separate - plugin time.
import { BehaviorSubject, map, Observable, skip, switchMap, tap } from "rxjs";
import { OutsideAppSettings } from "../../models/outsider.models";

@Component({
    selector: 'druid-outsider-outside-app-renderer',
    styleUrls: ['./outside-app-renderer.component.scss'],
    templateUrl: './outside-app-renderer.component.html',
    standalone: false
})
export class OutsideAppRendererComponent {

  @Input()
  set settings(settings: Array<AttributeValue>) {
    this.settings$.next(settings);
  }

  @Input()
  set contexts(contexts: Array<InlineContext>) {
    this.contexts$.next(contexts);
  }

  @ViewChild('appContainer', { read: ViewContainerRef, static: true }) viewContainer: ViewContainerRef;

  readonly objectSettings$ = new BehaviorSubject<OutsideAppSettings>(undefined);
  readonly contexts$ = new BehaviorSubject<Array<InlineContext>>([]);
  readonly settings$ = new BehaviorSubject<Array<AttributeValue>>([]);

  protected readonly settingsSub = this.settings$.pipe(
    map(settings => settings ? new OutsideAppSettings(this.attributeSerializer.deserializeAsObject(settings)) : undefined),
    tap(s => this.objectSettings$.next(s))
  ).subscribe();

  protected readonly renderAppSub = this.objectSettings$.pipe(
    skip(1),
    switchMap(s => new Observable<Type<Component>>(obs => {
        nf.loadRemoteModule(
          !s.type || s.type === 'script' ?
          {
            // type: 'script', // temp for react
            remoteEntry: s.remoteEntry, // 'http://127.0.0.1:8080/remoteEntry.js',
            // exposedModule: s.exposedModule,
            remoteName: s.remoteName, // 'mfe_react_spear',
            exposedModule: s.exposedModule
          } :
          {
            //sourceType: 'module',
            remoteName: "plugin",
            remoteEntry: s.remoteEntry,
            exposedModule: s.exposedModule
          }
      ).then(m => {
        obs.next(m[ s.componentName && s.componentName !== '' ? s.componentName : 'default' ]);
        obs.complete();
      });
    }).pipe(
      map(c => ({ s, c }))
    )),
    tap(({ s, c }) => {
      this.viewContainer.clear();
      // Just assume scripts are react apps for now. KISS
      if (!s.type || s.type === 'script') {
        const comp = this.viewContainer.createComponent(MfeReactComponent);
        (comp.instance as any).component = c;
      } else {
        this.viewContainer.createComponent(c);
      }
    })
  ).subscribe();

  constructor(
    private attributeSerializer: AttributeSerializerService,
    // private controlContainer?: ControlContainer
  ) {
  }

}