import { Component, OnInit, Inject, Input } from '@angular/core';
import { MEDIA_SETTINGS, MediaSettings, MediaFile } from '@classifieds-ui/media';
import { AttributeValue } from '@classifieds-ui/attributes';
import { MediaContentHandler } from '../../../handlers/media-content.handler';

@Component({
  selector: 'classifieds-ui-media-pane-renderer',
  templateUrl: './media-pane-renderer.component.html',
  styleUrls: ['./media-pane-renderer.component.scss']
})
export class MediaPaneRendererComponent implements OnInit {

  @Input()
  settings: Array<AttributeValue> = [];

  mediaFile: MediaFile;
  mediaBaseUrl: string;

  constructor(@Inject(MEDIA_SETTINGS) private mediaSettings: MediaSettings, private handler: MediaContentHandler) { }

  ngOnInit(): void {
    this.mediaBaseUrl = this.mediaSettings.imageUrl;
    this.handler.toObject(this.settings).subscribe((mediaFile: MediaFile) => {
      this.mediaFile = mediaFile;
    });
  }

  ngOnChanges(): void {
    this.mediaBaseUrl = this.mediaSettings.imageUrl;
    this.handler.toObject(this.settings).subscribe((mediaFile: MediaFile) => {
      this.mediaFile = mediaFile;
    });
  }

}
