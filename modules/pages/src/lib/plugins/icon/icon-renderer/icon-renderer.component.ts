import { Component, inject, Input } from '@angular/core';
import { Subject, switchMap, tap } from 'rxjs';
import { IconContentHandler } from '../../../handlers/icon-content.handler';
import { AttributeValue } from '@rollthecloudinc/attributes';
import { QIcon } from '../../../models/plugin.models';

@Component({
    selector: 'classifieds-ui-icon-renderer',
    templateUrl: './icon-renderer.component.html',
    styleUrls: ['./icon-renderer.component.scss'],
    standalone: false
})
export class IconRendererComponent {

    protected handler = inject(IconContentHandler)

    @Input()
    set settings(settings: Array<AttributeValue>) {
        this.settings$.next(settings)
    }

    iconName = ''
    label = ''
    hidden = false

    readonly settings$ = new Subject<Array<AttributeValue>>();
    readonly icon$ = new Subject<QIcon>();

    readonly settingsSub = this.settings$.pipe(
        switchMap(s => this.handler.toObject(s)),
        tap(icon => {
            this.icon$.next(icon);
        })
    ).subscribe();

    readonly iconSub = this.icon$.pipe(
        tap(icon => {
            this.iconName = icon.iconName
            this.label = icon.label
            this.hidden = icon.category == 'decorative'
        })
    ).subscribe();
}