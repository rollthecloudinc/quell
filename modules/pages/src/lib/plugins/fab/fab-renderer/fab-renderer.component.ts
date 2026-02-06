import { Component, inject, Input } from '@angular/core';
import { Subject } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { AttributeValue } from '@rollthecloudinc/attributes';
import { Fab } from '../../../models/plugin.models';
import { FabContentHandler } from '../../../handlers/fab-content.handler';

@Component({
  selector: 'classifieds-ui-fab-renderer',
  templateUrl: './fab-renderer.component.html',
  styleUrls: ['./fab-renderer.component.scss'],
  standalone: false
})
export class FabRendererComponent {

  protected handler = inject(FabContentHandler);

  @Input()
  set settings(settings: Array<AttributeValue>) {
    this.settings$.next(settings);
  }

  iconName: string;
  ariaLabel: string;
  action: string;
  text: string;
  minifab: boolean;
  extendedfab: boolean;

  readonly settings$ = new Subject<Array<AttributeValue>>();
  readonly iconButton$ = new Subject<Fab>();

  readonly settingsSub = this.settings$.pipe(
    switchMap(s => this.handler.toObject(s)),
    tap(button => this.iconButton$.next(button))
  ).subscribe();

  readonly buttonSub = this.iconButton$.pipe(
    tap(button => {
      this.iconName = button.iconName;
      this.ariaLabel = button.ariaLabel;
      this.action = button.action;
      this.text = button.text;
      this.minifab = button.minifab;
      this.extendedfab = button.text && button.text.length > 0;
    })
  ).subscribe();
}