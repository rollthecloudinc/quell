import { Component, inject, Input } from '@angular/core';
import { Subject, switchMap, tap } from 'rxjs';
import { LinkContentHandler } from '../../../handlers/link-content.handler';
import { AttributeValue } from '@rollthecloudinc/attributes';
import { QLink } from '../../../models/plugin.models';

@Component({
    selector: 'classifieds-ui-link-renderer',
    templateUrl: './link-renderer.component.html',
    styleUrls: ['./link-renderer.component.scss'],
    standalone: false
})
export class LinkRendererComponent {

    protected handler = inject(LinkContentHandler)

    @Input()
    set settings(settings: Array<AttributeValue>) {
        this.settings$.next(settings)
    }

    text = ''
    route: Array<any>
    href: string
    appearance = 'text'

    readonly settings$ = new Subject<Array<AttributeValue>>();
    readonly link$ = new Subject<QLink>();

    readonly settingsSub = this.settings$.pipe(
        switchMap(s => this.handler.toObject(s)),
        tap(link => {
            this.link$.next(link);
        })
    ).subscribe();

    readonly linkSub = this.link$.pipe(
        tap(link => {
            this.text = link.text
            this.route = link.url.indexOf('/') === 0 ? link.url.split('/').map((v, i) => i === 0 ? `/${v}` : v) : undefined
            this.href = link.url.indexOf('/') !== 0 ? link.url : undefined
            this.appearance = link.appearance || 'text'
        })
    ).subscribe();
}