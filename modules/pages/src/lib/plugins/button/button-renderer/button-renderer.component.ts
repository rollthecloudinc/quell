import { Component, Input, inject } from '@angular/core';
import { AttributeValue } from '@rollthecloudinc/attributes';
import { combineLatest, Subject } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { QButton } from '../../../models/plugin.models';
import { ButtonContentHandler } from '../../../handlers/button-content.handler';
import { TargetParamResolverService } from '@rollthecloudinc/dparam';

@Component({
    selector: 'classifieds-ui-button-renderer',
    templateUrl: './button-renderer.component.html',
    styleUrls: ['./button-renderer.component.scss'],
    standalone: false
})
export class ButtonRendererComponent {

    protected handler = inject(ButtonContentHandler)
    protected targetParamResolver = inject(TargetParamResolverService)

    @Input()
    set settings(settings: Array<AttributeValue>) {
        this.settings$.next(settings)
    }

    @Input()
    set resolvedContext(resolvedContext: any) {
        this.resolvedContext$.next(resolvedContext);
    }

    raised = true
    color = 'primary'
    disabled = false
    text = ''
    action: string
    resolvedParams: { [key: string]: any } = {};

    readonly settings$ = new Subject<Array<AttributeValue>>();
    readonly button$ = new Subject<QButton>();
    readonly resolvedContext$ = new Subject<any>();

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

    readonly resolvedContextSub = combineLatest([this.resolvedContext$, this.button$]).pipe(
        switchMap(([resolvedContext, button]) => this.targetParamResolver.resolveParamsForTarget(
            button.paramsString || '',
            button.params || [],
            resolvedContext
        )),
        tap(resolvedParams => {
            this.resolvedParams = resolvedParams;
        })
    ).subscribe()
}