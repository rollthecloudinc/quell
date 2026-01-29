import { Component, ElementRef } from '@angular/core';

@Component({
  selector: 'quell-popover-overlay',
  templateUrl: './popover-overlay.component.html',
  styleUrls: ['./popover-overlay.component.scss'],
  standalone: false
})
export class PopoverOverlayComponent {
  // This gets set by the handler:
  // componentRef.instance.data = { panelPageId, anchorElement };
  data!: { panelPageId: string; anchorElement?: HTMLElement };

  get panelPageId() {
    return this.data?.panelPageId ?? '';
  }

  constructor(private host: ElementRef<HTMLElement>) {}

  close() {
    // Popovers close by removing themselves
    const el = this.host.nativeElement.closest('.cdk-overlay-pane');
    if (el) el.remove();
  }
}