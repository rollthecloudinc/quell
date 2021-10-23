import { EntityCollectionDataService, DefaultDataService, DefaultDataServiceConfig, HttpUrlGenerator } from "@ngrx/data";
import { Update } from "@ngrx/entity";
import { Observable, of } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { map, switchMap } from "rxjs/operators";
import  * as uuid from 'uuid';
import { CrudAdaptorPluginManager } from "crud";

export class S3DataService<T> extends DefaultDataService<T> implements EntityCollectionDataService<T> {

  constructor(
    entityName: string,
    protected http: HttpClient,
    protected httpUrlGenerator: HttpUrlGenerator,
    protected crud: CrudAdaptorPluginManager,
    config?: DefaultDataServiceConfig
  ) {
    super(entityName, http, httpUrlGenerator, config);
  }

  add(entity: T): Observable<T> {

    return this.crud.getPlugin('aws_s3_entity').pipe(
      switchMap(p => p.create({ object: entity, identity: ({ object }) => of({ identity: uuid.v4() }) })),
      map(() => entity)
    );

  }
  update(update: Update<T>): Observable<T> {
    return of(undefined);
  }
  upsert(entity: T): Observable<T> {
    //this.entities.set(entity.id, entity);
    return of(entity);

    /*return new Observable<T>(obs => {
      const s3 = new S3Client({
        region: 'us-east-1',
        credentials: fromCognitoIdentityPool({
          client: new CognitoIdentityClient({ region: 'us-east-1' }),
          identityPoolId: 'us-east-1:6f5cdc41-35b0-41ca-9f6b-7eca11320942',
          logins: {
            'cognito-identity.amazonaws.com': () => this.authFacade.token$.toPromise()
          }
        }),
      });
      const command = new PutObjectCommand({
        Bucket: 'classifieds-ui-dev',
        Key: 'panelpages/test_2021102301.json.gz',
        Body: JSON.stringify(entity),
        ContentType: 'application/json',
        ContentEncoding: 'gzip'
      });
      s3.send(command).then(res => {
        console.log('sent');
        console.log(res);
        obs.next(entity);
        obs.complete();
      }).catch(e => {
        console.log('error')
        console.log(e);
        obs.error()
        obs.complete();
      });
    });*/

  }
}