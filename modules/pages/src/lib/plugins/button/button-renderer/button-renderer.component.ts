import { Component, Input, inject } from '@angular/core';
import { AttributeValue } from '@rollthecloudinc/attributes';
import { Subject } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { QButton } from '../../../models/plugin.models';
import { ButtonContentHandler } from '../../../handlers/button-content.handler';

@Component({
    selector: 'classifieds-ui-button-renderer',
    templateUrl: './button-renderer.component.html',
    styleUrls: ['./button-renderer.component.scss'],
    standalone: false
})
export class ButtonRendererComponent {

    protected handler = inject(ButtonContentHandler)

    @Input()
    set settings(settings: Array<AttributeValue>) {
        this.settings$.next(settings)
    }

    raised = true
    color = 'primary'
    disabled = false
    text = ''
    action: string

    readonly settings$ = new Subject<Array<AttributeValue>>();
    readonly button$ = new Subject<QButton>();

    readonly settingsSub = this.settings$.pipe(
        switchMap(s => this.handler.toObject(s)),
        tap(button => {
            this.button$.next(button);
        })
    ).subscribe();

    readonly buttonSub = this.button$.pipe(
        tap(button => {
            this.text = button.text
            this.action = button.action
        })
    ).subscribe();
}