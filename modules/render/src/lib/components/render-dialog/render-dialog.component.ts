import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'quell-render-dialog',
  templateUrl: './render-dialog.component.html',
  styleUrls: ['./render-dialog.component.scss'],
  standalone: false
})
export class RenderDialogComponent {
  panelPageId: string; // Stores the panel page ID

  constructor(
    @Inject(MAT_DIALOG_DATA) data: { panelPageId: string }, // Accept panelPageId via dialog data
    private dialog: MatDialog
  ) {
    this.panelPageId = data.panelPageId || ''; // Assign the incoming panelPageId to the local property
  }

  // Method to close the dialog
  onClose() {
    this.dialog.closeAll();
  }
}