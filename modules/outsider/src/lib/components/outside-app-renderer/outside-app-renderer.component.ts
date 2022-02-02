import { Component, Input } from "@angular/core";
// import { ControlContainer } from "@angular/forms";
import { AttributeSerializerService, AttributeValue } from 'attributes';
import { InlineContext } from "context";
import { BehaviorSubject, map, tap } from "rxjs";
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

  readonly objectSettings$ = new BehaviorSubject<OutsideAppSettings>(undefined);
  readonly contexts$ = new BehaviorSubject<Array<InlineContext>>([]);
  readonly settings$ = new BehaviorSubject<Array<AttributeValue>>([]);

  protected readonly settingsSub = this.settings$.pipe(
    map(settings => settings ? new OutsideAppSettings(this.attributeSerializer.deserializeAsObject(settings)) : undefined),
    tap(s => this.objectSettings$.next(s))
  ).subscribe();

  constructor(
    private attributeSerializer: AttributeSerializerService,
    // private controlContainer?: ControlContainer
  ) {
  }

}