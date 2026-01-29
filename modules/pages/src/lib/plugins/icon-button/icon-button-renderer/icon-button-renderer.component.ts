import { Component, inject, Input } from '@angular/core';
import { Subject } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { AttributeValue } from '@rollthecloudinc/attributes';
import { IconButton } from '../../../models/plugin.models';
import { IconButtonContentHandler } from '../../../handlers/icon-button-content.handler';

@Component({
  selector: 'classifieds-ui-icon-button-renderer',
  templateUrl: './icon-button-renderer.component.html',
  styleUrls: ['./icon-button-renderer.component.scss'],
  standalone: false
})
export class IconButtonRendererComponent {

  protected handler = inject(IconButtonContentHandler);

  @Input()
  set settings(settings: Array<AttributeValue>) {
    this.settings$.next(settings);
  }

  iconName: string;
  ariaLabel: string;
  action: string;

  readonly settings$ = new Subject<Array<AttributeValue>>();
  readonly iconButton$ = new Subject<IconButton>();

  readonly settingsSub = this.settings$.pipe(
    switchMap(s => this.handler.toObject(s)),
    tap(button => this.iconButton$.next(button))
  ).subscribe();

  readonly buttonSub = this.iconButton$.pipe(
    tap(button => {
      this.iconName = button.iconName;
      this.ariaLabel = button.ariaLabel;
      this.action = button.action;
    })
  ).subscribe();
}