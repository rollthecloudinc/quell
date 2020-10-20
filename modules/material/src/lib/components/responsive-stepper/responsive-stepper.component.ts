import { Directionality } from '@angular/cdk/bidi';
import { CdkStep, CdkStepper, StepperSelectionEvent } from '@angular/cdk/stepper';
import {
    AfterViewChecked,
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChildren,
    ElementRef,
    EventEmitter,
    forwardRef,
    Inject,
    Input,
    Optional,
    Output,
    QueryList,
    ViewChildren
} from '@angular/core';
import { MatStep, MatStepper } from '@angular/material/stepper';
import { DOCUMENT } from '@angular/common';

const MAT_STEPPER_PROXY_FACTORY_PROVIDER = {
    provide: MatStepper,
    deps: [
        forwardRef(() => ResponsiveStepperComponent),
        [new Optional(), Directionality],
        ChangeDetectorRef,
        [new Inject(DOCUMENT)]
    ],
    useFactory: MAT_STEPPER_PROXY_FACTORY
};

const CDK_STEPPER_PROXY_FACTORY_PROVIDER = { ...MAT_STEPPER_PROXY_FACTORY_PROVIDER, provide: CdkStepper };

export function MAT_STEPPER_PROXY_FACTORY(component: ResponsiveStepperComponent, directionality: Directionality,
                                          changeDetectorRef: ChangeDetectorRef, document: Document) {

    // We create a fake stepper primarily so we can generate a proxy from it. The fake one, however, is used until
    // our view is initialized. The reason we need a proxy is so we can toggle between our 2 steppers
    // (vertical and horizontal) depending on  our "orientation" property. Probably a good idea to include a polyfill
    // for the Proxy class: https://github.com/GoogleChrome/proxy-polyfill.

    const elementRef = new ElementRef(document.createElement('mat-horizontal-stepper'));
    const stepper = new MatStepper(directionality, changeDetectorRef, elementRef, document);
    return new Proxy(stepper, {
        get: (target, property) => Reflect.get(component.stepper || target, property),
        set: (target, property, value) => Reflect.set(component.stepper || target, property, value)
    });
}

/**
 * Configurable vertical/horizontal layout.<br>
 * Keeps input fields state.<br>
 * Allow to make headers un-clickable (disabled) with normal cursor: see updateStepState().
 *
 * Authors: @grant77, @davideas
 */
@Component({
    selector: 'responsive-stepper',
    // templateUrl: './stepper.component.html',
    // styleUrls: ['./stepper.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        MAT_STEPPER_PROXY_FACTORY_PROVIDER,
        CDK_STEPPER_PROXY_FACTORY_PROVIDER
    ],
    template: `
        <ng-container [ngSwitch]="orientation">
            <mat-horizontal-stepper *ngSwitchDefault
                                    [labelPosition]="labelPosition"
                                    [linear]="linear"
                                    [selected]="selected"
                                    [selectedIndex]="selectedIndex"
                                    (animationDone)="animationDone.emit($event)"
                                    (selectionChange)="selectionChange.emit($event)">
            </mat-horizontal-stepper>
            <mat-vertical-stepper *ngSwitchCase="'vertical'"
                                  [linear]="linear"
                                  [selected]="selected"
                                  [selectedIndex]="selectedIndex"
                                  (animationDone)="animationDone.emit($event)"
                                  (selectionChange)="selectionChange.emit($event)">
            </mat-vertical-stepper>
        </ng-container>`
})
export class ResponsiveStepperComponent implements AfterViewInit, AfterViewChecked {

    // public properties
    @Input() labelPosition?: 'bottom' | 'end';
    @Input() linear?: boolean;
    @Input() orientation?: 'horizontal' | 'vertical';
    @Input() selected?: CdkStep;
    @Input() selectedIndex?: number;

    // public events
    @Output() animationDone = new EventEmitter<void>();
    @Output() selectionChange = new EventEmitter<StepperSelectionEvent>();
    @Output() orientationChange = new EventEmitter<string>();

    // internal properties
    @ViewChildren(MatStepper) stepperList!: QueryList<MatStepper>;
    @ContentChildren(MatStep) steps!: QueryList<MatStep>;

    get stepper(): MatStepper {
        return this.stepperList && this.stepperList.first;
    }

    // private properties
    private lastSelectedIndex?: number;
    private needsFocus = false;
    private htmlSteps: Array<HTMLElement> = [];

    constructor(private changeDetectorRef: ChangeDetectorRef) {
    }

    ngAfterViewInit() {
        this.reset();
        this.stepperList.changes.subscribe(() => this.reset());
        // Emitted from (animationDone) event
        this.selectionChange.subscribe((e: StepperSelectionEvent) => this.lastSelectedIndex = e.selectedIndex);
        this.syncHTMLSteps();
        // Initial step selection with enter animation if initial step > 1
        setTimeout(() => this.stepper.selectedIndex = this.selectedIndex, 400);
    }

    ngAfterViewChecked() {
        if (this.needsFocus) {
            this.needsFocus = false;
            const { _elementRef, _keyManager, selectedIndex } = this.stepper as any;
            _elementRef.nativeElement.focus();
            _keyManager.setActiveItem(selectedIndex);
        }
    }

    get isHorizontal(): boolean {
        return this.orientation === 'horizontal';
    }

    get isVertical(): boolean {
        return this.orientation === 'vertical';
    }

    next() {
        this.stepper.next();
    }

    previous() {
        this.stepper.previous();
    }

    /**
     * Enable/Disable the click on the step header.
     *
     * @param step The step number
     * @param enabled The new state
     */
    updateStepState(step: number, enabled: boolean) {
        if (this.htmlSteps.length > 0) {
            this.htmlSteps[step - 1].style.pointerEvents = enabled ? '' : 'none';
        }
    }

    /**
     * Sync from the dom the list of HTML elements for the steps.
     */
    private syncHTMLSteps() {
        this.htmlSteps = [];
        let increment = 1;
        let stepper: HTMLElement = document.querySelector('.mat-stepper-vertical');
        if (!stepper) {
            increment = 2; // 2, because Angular adds 2 elements for each horizontal step
            stepper = document.querySelector('.mat-horizontal-stepper-header-container');
        }
        for (let i = 0; i < stepper.children.length; i += increment) {
            this.htmlSteps.push(stepper.children[i] as HTMLElement);
        }
    }

    private reset() {
        // Delay is necessary (Too early in AfterViewInit: HTMLElements not loaded)
        setTimeout(() => this.syncHTMLSteps(), 100);

        const { stepper, steps, changeDetectorRef, lastSelectedIndex } = this;
        stepper.steps.reset(steps.toArray());
        stepper.steps.notifyOnChanges();
        if (lastSelectedIndex) {
            stepper.selectedIndex = lastSelectedIndex;
            // After htmlSteps have been synced
            setTimeout(() => this.orientationChange.emit(this.orientation), 101);
        }
        Promise.resolve().then(() => {
            this.needsFocus = true;
            changeDetectorRef.markForCheck();
        });
    }

}
