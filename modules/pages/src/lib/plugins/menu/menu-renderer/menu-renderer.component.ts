import { Component, inject, Input } from '@angular/core';
import { Subject } from 'rxjs';
import { tap, switchMap } from 'rxjs/operators';
import { MenuItem, QMenu } from '../../../models/plugin.models';
import { MenuContentHandler } from '../../../handlers/menu-content.handler';
import { AttributeValue } from '@rollthecloudinc/attributes';

@Component({
    selector: 'classifieds-ui-menu-renderer',
    templateUrl: './menu-renderer.component.html',
    styleUrls: ['./menu-renderer.component.scss'],
    standalone: false
})
export class MenuRendererComponent {

    protected handler = inject(MenuContentHandler)

    @Input()
    set settings(settings: Array<AttributeValue>) {
        this.settings$.next(settings)
    }

    label: string;
    iconName: string;
    items: Array<MenuItem>;

    readonly settings$ = new Subject<Array<AttributeValue>>();
    readonly menu$ = new Subject<QMenu>();

    readonly settingsSub = this.settings$.pipe(
        switchMap(s => this.handler.toObject(s)),
        tap(menu => {
            this.menu$.next(menu);
        })
    ).subscribe();

    readonly menuSub = this.menu$.pipe(
        tap(menu => {
            this.label = menu.label
            this.iconName = menu.iconName
            this.items = menu.items ? menu.items.map(item => new MenuItem(item)) : []
        })
    ).subscribe();
}