import { Injectable } from '@angular/core';
import { ContentHandler, ContentBinding, ContentPluginEditorOptions } from '@rollthecloudinc/content';
import { Dataset } from '@rollthecloudinc/datasource';
import { AttributeValue, AttributeSerializerService } from '@rollthecloudinc/attributes';
import { FilesService, MediaFile } from '@rollthecloudinc/media';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class MediaContentHandler implements ContentHandler {

  types = ['image/png', 'image/jpg', 'image/jpeg', 'image/gif'];

  constructor(private filesService: FilesService, private attributeSerializer: AttributeSerializerService) { }

  handleFile(file: File): Observable<Array<AttributeValue>> {
    return this.filesService.bulkUpload({ files: [file] }).pipe(
      map(files => this.buildSettings(files[0]))
    );
  }

  handlesType(type: string): boolean {
    return this.types.find(t => t === type) !== undefined;
  }

  implementsRendererOverride(): boolean {
    return false;
  }

  hasRendererOverride(settings: Array<AttributeValue>): Observable<boolean> {
    return of(false);
  }

  isDynamic(settings: Array<AttributeValue>): boolean {
    return false;
  }

  isData(settings: Array<AttributeValue>): boolean {
    return false;
  }

  buildDynamicItems(settings: Array<AttributeValue>, metadata: Map<string, any>): Observable<Array<AttributeValue>> {
    return of([]);
  }

  fetchDynamicData(settings: Array<AttributeValue>, metadata: Map<string, any>): Observable<any> {
    return of(new Dataset());
  }

  getBindings(settings: Array<AttributeValue>, type: string, metadata?: Map<string, any>): Observable<Array<ContentBinding>> {
    return of([]);
  }

  toObject(settings: Array<AttributeValue>): Observable<MediaFile> {
    return of(this.attributeSerializer.deserializeAsObject(settings));
  }

  buildSettings(mediaFile: MediaFile): Array<AttributeValue> {
    mediaFile.fileName = 'placeholdername';
    return this.attributeSerializer.serialize(mediaFile, 'root').attributes;
  }

  stateDefinition(settings: Array<AttributeValue>): Observable<any> {
    return of({
      mediaLoading: 'y',
      mediaLoaded: 'n',
      loadError: 'n',
      loadDuration: 'y'
    });
  }

  editorOptions(settings: Array<AttributeValue>): Observable<ContentPluginEditorOptions> {
    return of(new ContentPluginEditorOptions());
  }

}
