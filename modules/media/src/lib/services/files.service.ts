import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, forkJoin, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MEDIA_SETTINGS } from '../media.tokens';
import { MediaSettings, MediaFile } from '../models/media.models';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FilesService {
  constructor(@Inject(MEDIA_SETTINGS) private settings: MediaSettings, private http: HttpClient) {}
  bulkUpload(files: Array<File>): Observable<Array<MediaFile>> {
    const requests$: Array<Observable<MediaFile>> = [];
    files.forEach(f => {
      if(f) {
        const formData = new FormData();
        formData.append('File', f, f.name);
        requests$.push(this.http.post<MediaFile>(this.settings.endpointUrl, formData).pipe(
          catchError(e => {
            return throwError(new Error("Error uploading images."));
          })
        ));
      }
    });
    return requests$.length > 0 ? forkJoin(requests$) : of([]);
  }
  convertToFiles(mediaFiles: Array<MediaFile>): Observable<Array<File>> {
    const requests$ = mediaFiles.map(f => new Observable<File>(obs => {
      fetch(`${this.settings.imageUrl}/${f.path}`).then(r => {
        r.blob().then(d => {
          new Promise(resolve => {
            let reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(d);
          }).then((d2: string) => {
            const arrayBufferFromBase64 = this.convertDataURIToBinary(d2);
            const file = new File([arrayBufferFromBase64], f.fileName, {type: 'image/png' });
            obs.next(file);
            obs.complete();
          });
        });
      });
    }));
    return forkJoin(requests$);
  }
  convertDataURIToBinary(dataURI: string) {
    var BASE64_MARKER = ';base64,';
    var base64Index = dataURI.indexOf(BASE64_MARKER) + BASE64_MARKER.length;
    var base64 = dataURI.substring(base64Index);
    var raw = window.atob(base64);
    var rawLength = raw.length;
    var array = new Uint8Array(new ArrayBuffer(rawLength));

    for(var i = 0; i < rawLength; i++) {
      array[i] = raw.charCodeAt(i);
    }
    return array;
  }
}
