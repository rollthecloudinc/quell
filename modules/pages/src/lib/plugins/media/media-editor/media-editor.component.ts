import { Component, OnInit, Inject } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, UntypedFormArray, Validators, UntypedFormControl } from '@angular/forms';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { Pane } from '@rollthecloudinc/panels';
import { AttributeTypes } from '@rollthecloudinc/attributes';
import { FilesService, MediaFile } from '@rollthecloudinc/media';
import { MediaContentHandler } from '../../../handlers/media-content.handler';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'classifieds-ui-media-editor',
  templateUrl: './media-editor.component.html',
  styleUrls: ['./media-editor.component.scss']
})
export class MediaEditorComponent implements OnInit {

  media: File;

  mediaTypes = '.png,.jpg,.jpeg,.gif,.svg';

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: { panelFormGroup: UntypedFormGroup; pane: Pane; paneIndex: number;  },
    private dialogRef: MatDialogRef<MediaEditorComponent>,
    private fb: UntypedFormBuilder,
    private filesService: FilesService,
    private handler: MediaContentHandler
  ) { }

  ngOnInit(): void {
    if(this.data.pane !== undefined) {
      this.handler.toObject(this.data.pane.settings).pipe(
        switchMap((mediaFile: MediaFile) => this.filesService.convertToFiles([mediaFile]))
      ).subscribe(files => {
        this.media = files[0];
      });
    }
  }

  onSelectMedia(event) {
    this.media = event.addedFiles[0];
    this.handler.handleFile(this.media).subscribe(settings => {
      if(this.data.paneIndex === undefined) {
        (this.data.panelFormGroup.get('panes') as UntypedFormArray).push(this.fb.group({
          contentPlugin: 'media',
          name: new UntypedFormControl(''),
          label: new UntypedFormControl(''),
          rule: new UntypedFormControl(''),
          settings: new UntypedFormArray(settings.map(s => this.fb.group({
            name: new UntypedFormControl(s.name, Validators.required),
            type: new UntypedFormControl(s.type, Validators.required),
            displayName: new UntypedFormControl(s.displayName, Validators.required),
            value: new UntypedFormControl(s.value, Validators.required),
            computedValue: new UntypedFormControl(s.value, Validators.required),
          })))
        }));
      }
      this.dialogRef.close();
    });
  }

  onRemoveMedia(event) {
    this.media = undefined;
  }

}
