import { Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatRipple } from '@angular/material/core';

@Component({
  selector: 'classifieds-ui-cursor-overlay',
  templateUrl: './cursor-overlay.component.html',
  styleUrls: ['./cursor-overlay.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: false
})
export class CursorOverlayComponent {
    @ViewChild(MatRipple) ripple: MatRipple;

    burst() {
        this.ripple.launch({
            persistent: false,
            centered: true
        });
    }
}