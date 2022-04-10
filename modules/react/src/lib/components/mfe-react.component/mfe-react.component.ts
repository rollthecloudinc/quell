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
  // styleUrls: ['./MyReactComponent.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class MfeReactComponent implements OnChanges, OnDestroy, AfterViewInit {
  @ViewChild(containerElementName, {static: false}) containerRef: ElementRef;

  @Input() public counter = 10;
  @Input() component: React.Component;
  @Output() public componentClick = new EventEmitter<void>();

  constructor() {
    this.handleDivClicked = this.handleDivClicked.bind(this);
  }

  public handleDivClicked() {
    if (this.componentClick) {
      this.componentClick.emit();
      this.render();
    }
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
    const {counter} = this;

    /*ReactDOM.render(<div className={'i-am-classy'}>
      <MyReactComponent counter={counter} onClick={this.handleDivClicked}/>
    </div>, this.containerRef.nativeElement);*/

    ReactDOM.hydrate(this.component, this.containerRef.nativeElement);

  }
}