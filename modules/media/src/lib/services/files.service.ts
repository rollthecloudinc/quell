import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, forkJoin, of, throwError, firstValueFrom } from 'rxjs';
import { AuthFacade } from '@ng-druid/auth';
import { CognitoSettings, COGNITO_SETTINGS } from '@ng-druid/awcog';
import { catchError } from 'rxjs/operators';
import { MEDIA_SETTINGS } from '../media.tokens';
import { MediaSettings, MediaFile } from '../models/media.models';
import { map } from 'rxjs/operators';
import { Upload } from '@aws-sdk/lib-storage';
import * as uuid from 'uuid';
import { fromCognitoIdentityPool } from '@aws-sdk/credential-provider-cognito-identity';
import { CognitoIdentityClient } from '@aws-sdk/client-cognito-identity';
import { S3Client } from '@aws-sdk/client-s3';
// import * as mime from 'mime-types';
@Injectable({
  providedIn: 'root'
})
export class FilesService {
  constructor(
    @Inject(MEDIA_SETTINGS) private settings: MediaSettings, 
    @Inject(COGNITO_SETTINGS) private cognitoSettings: CognitoSettings,
    private http: HttpClient,
    private authFacade: AuthFacade, 
  ) {}

  bulkUpload({ files, fileNameOverride, nocache }: { files: Array<File>, fileNameOverride?: string, nocache?: boolean }): Observable<Array<MediaFile>> {
    const requests$: Array<Observable<MediaFile>> = [];
    files.forEach(f => {
      if(f) {
        /*const formData = new FormData();
        formData.append('File', f, f.name);
        requests$.push(this.http.post<MediaFile>(this.settings.endpointUrl, formData).pipe(
          catchError(e => {
            return throwError(new Error("Error uploading images."));
          })
        ));*/

        requests$.push(new Observable<MediaFile>(obs => {
          const id = fileNameOverride ? fileNameOverride : uuid.v4();
          const [ _, ext ] = f.name.split('.', 2);
          const fileName = id + /*'.' + mime.extension(f.type);*/ (ext ? '.' + ext : '');
          const upload = new Upload({
            client: this.buildClient(),
            params: {
              Bucket: this.settings.bucket,
              Key: this.settings.prefix + fileName,
              Body: f,
              ContentType: f.type,
              ...(nocache ? { CacheControl: 'no-cache' } : {})
              //ContentEncoding: 'gzip'
            }
          });
          upload.done().then(() => {
            obs.next(new MediaFile({   
              id,
              contentType: f.type,
              contentDisposition: '',
              path: fileName,
              realPath: this.settings.prefix + fileName,
              length: f.size,
              fileName: f.name,
              extension: /*mime.extension(f.type)*/ ext && ext !== '' ? ext : undefined
            }));
            obs.complete();
          });
        }));

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
            const file = new File([arrayBufferFromBase64], f.fileName, {type: f.contentType });
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

  buildClient() {
    return new S3Client({
      region: this.cognitoSettings.region,
      credentials: fromCognitoIdentityPool({
        client: new CognitoIdentityClient({ region: this.cognitoSettings.region }),
        identityPoolId: this.cognitoSettings.identityPoolId,
        logins: {
          [`cognito-idp.${this.cognitoSettings.region}.amazonaws.com/${this.cognitoSettings.userPoolId}`]: () => firstValueFrom(this.authFacade.getUser$.pipe(map(u => u ? u.id_token : undefined)))
        }
      }),
    })
  }

  isImage({ file }: { file: File }): boolean {
    return file.type && file.type.indexOf('image/') === 0;
  }

  isVideo({ file }: { file: File }): boolean {
    return file.type && file.type.indexOf('video/') === 0;
  }

}
