import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

const containerElementName = 'mfeReactComponent';

@Component({
  selector: 'druid-mfe-react',
  template: `<span #${containerElementName}></span>`,
  encapsulation: ViewEncapsulation.None,
})
export class MfeReactComponent implements OnChanges, OnDestroy, AfterViewInit {
  @ViewChild(containerElementName, {static: false}) containerRef: ElementRef;

  @Input() component: React.Component;

  constructor() {
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.render();
  }

  ngAfterViewInit() {
    this.render();
  }

  ngOnDestroy() {
    ReactDOM.unmountComponentAtNode(this.containerRef.nativeElement);
  }

  private render() {
    const c = this.component();
    ReactDOM.render(c, this.containerRef.nativeElement);
  }
}