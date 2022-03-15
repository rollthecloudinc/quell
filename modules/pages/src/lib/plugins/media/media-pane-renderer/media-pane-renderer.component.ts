import { Component, OnInit, Inject, Input, ViewChild, ElementRef, AfterViewInit, Output, EventEmitter } from '@angular/core';
import { MEDIA_SETTINGS, MediaSettings, MediaFile } from '@ng-druid/media';
import { AttributeSerializerService, AttributeValue } from '@ng-druid/attributes';
import { MediaContentHandler } from '../../../handlers/media-content.handler';
import { EntityCollectionDataService, EntityCollectionService, EntityServices } from '@ngrx/data';
import { Pane, PanelPageState } from '@ng-druid/panels';

@Component({
  selector: 'classifieds-ui-media-pane-renderer',
  templateUrl: './media-pane-renderer.component.html',
  styleUrls: ['./media-pane-renderer.component.scss']
})
export class MediaPaneRendererComponent implements OnInit, AfterViewInit {

  @Input()
  settings: Array<AttributeValue> = [];

  @Input()
  ancestory: Array<number> = [];

  @Input()
  state: any = {};

  @Output()
  stateChange = new EventEmitter<any>();

  @ViewChild('img', { static: true }) image: ElementRef<HTMLImageElement>;

  mediaFile: MediaFile;
  mediaBaseUrl: string;

  private panelPageStateService: EntityCollectionService<PanelPageState>;

  constructor(
    @Inject(MEDIA_SETTINGS) private mediaSettings: MediaSettings, 
    private handler: MediaContentHandler,
    private attributeSerializer: AttributeSerializerService,
    es: EntityServices
  ) { 
    this.panelPageStateService = es.getEntityCollectionService('PanelPageState');
  }

  ngOnInit(): void {
    console.log('media ancestory is');
    console.log(this.ancestory);
    console.log('my state is:');
    console.log(this.state);
    this.mediaBaseUrl = this.mediaSettings.imageUrl;
    this.handler.toObject(this.settings).subscribe((mediaFile: MediaFile) => {
      this.mediaFile = mediaFile;
    });
  }

  ngAfterViewInit() {
    this.image.nativeElement.onload = () => {
      console.log('image loaded');

      this.stateChange.emit({ mediaLoading: 'n' });
      // hard coded test.
      // @todo: need a way for any content to easily update its state without knowing page id or ancestory or context used could be used outside pages.
      /*this.panelPageStateService.upsert(new PanelPageState({ 
        // id: '0e5f4638-20d6-11ec-b5a7-de55e72cff0f', 
        id: '0e5f4638-20d6-11ec-b5a7-de55e72cff0f',
        panels: [
          {
            panes: [
              {
                state: this.attributeSerializer.serialize({ mediaLoading: 'n' }, 'root')
              }
            ]
          },
          { 
            panes: [
            ] 
          }
        ]
      })).subscribe();*/
    };
  }

  ngOnChanges(): void {
    this.mediaBaseUrl = this.mediaSettings.imageUrl;
    this.handler.toObject(this.settings).subscribe((mediaFile: MediaFile) => {
      this.mediaFile = mediaFile;
    });
  }

}
