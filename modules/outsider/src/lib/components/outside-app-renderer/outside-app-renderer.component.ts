import { loadRemoteModule } from "@angular-architects/module-federation";
import { Component, Input, Type, ViewChild, ViewContainerRef } from "@angular/core";
// import { ControlContainer } from "@angular/forms";
import { AttributeSerializerService, AttributeValue } from '@ng-druid/attributes';
import { InlineContext } from '@ng-druid/context';
import { MfeReactComponent } from "@ng-druid/react"; // this will need to be separate - plugin time.
import { BehaviorSubject, map, Observable, skip, switchMap, tap } from "rxjs";
import { OutsideAppSettings } from "../../models/outsider.models";

@Component({
  selector: 'druid-outsider-outside-app-renderer',
  styleUrls: ['./outside-app-renderer.component.scss'],
  templateUrl: './outside-app-renderer.component.html'
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
      loadRemoteModule({
        /* type: 'module',
        remoteEntry: s.remoteEntry,
        exposedModule: s.exposedModule*/

        // react hard-code just get it working
        type: 'script', // temp for react
        remoteEntry: 'http://127.0.0.1:8080/remoteEntry.js',
        exposedModule: './Button',
        remoteName: 'mfe_react_spear',
      }).then(m => {
        // obs.next(m[s.componentName]);
        obs.next(m);
        obs.complete();
      });
    })),
    tap(c => {
      this.viewContainer.clear();
      const comp = this.viewContainer.createComponent(MfeReactComponent);
      (comp.instance as any).component = c;
    })
  ).subscribe();

  constructor(
    private attributeSerializer: AttributeSerializerService,
    // private controlContainer?: ControlContainer
  ) {
  }

}