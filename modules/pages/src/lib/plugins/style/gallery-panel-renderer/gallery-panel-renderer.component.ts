import { Component, OnInit, Input, Inject } from '@angular/core';
import { AttributeValue } from '@classifieds-ui/attributes';
import { MediaSettings, MEDIA_SETTINGS } from '@classifieds-ui/media';
import { Pane } from '../../../models/page.models';
import { MediaContentHandler } from '../../../handlers/media-content.handler';
import { forkJoin } from 'rxjs';
import { INgxGalleryOptions, INgxGalleryImage, NgxGalleryAnimation } from '@kolkov/ngx-gallery';

@Component({
  selector: 'classifieds-ui-gallery-panel-renderer',
  templateUrl: './gallery-panel-renderer.component.html',
  styleUrls: ['./gallery-panel-renderer.component.scss']
})
export class GalleryPanelRendererComponent implements OnInit {

  @Input()
  settings: Array<AttributeValue> = [];

  @Input()
  panes: Array<Pane> = [];

  @Input()
  originPanes: Pane;

  @Input()
  originMappings: Array<number> = [];

  mediaBaseUrl: string;

  galleryOptions: Array<INgxGalleryOptions> = [
    {
      width: '100%',
      //height: '400px',
      thumbnailsColumns: 4,
      previewFullscreen: true,
      imageAnimation: NgxGalleryAnimation.Slide,
      lazyLoading: false
    },
    // max-width 800
    /*{
      breakpoint: 800,
      width: '100%',
      height: '600px',
      imagePercent: 80,
      thumbnailsPercent: 20,
      thumbnailsMargin: 20,
      thumbnailMargin: 20
    },
    // max-width 400
    {
      breakpoint: 400,
      preview: false
    }*/
  ];
  galleryImages: Array<INgxGalleryImage> = [];

  constructor(
    @Inject(MEDIA_SETTINGS) mediaSettings: MediaSettings,
    private mediaHandler: MediaContentHandler
  ) {
    this.mediaBaseUrl = mediaSettings.imageUrl;
  }

  ngOnInit(): void {
    //console.log('gallery panel');
    const mediaFiles$ = this.panes.map(p => this.mediaHandler.toObject(p.settings));
    forkJoin(mediaFiles$).subscribe((mediaFiles) => {
      //console.log(mediaFiles);
      this.galleryImages = mediaFiles.map(i => ({
        small: `${this.mediaBaseUrl}/${i.path}`,
        medium: `${this.mediaBaseUrl}/${i.path}`,
        big: `${this.mediaBaseUrl}/${i.path}`
      }));
    });
  }

}
