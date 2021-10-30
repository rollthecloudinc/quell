import { EntityCollectionDataService, DefaultDataService, DefaultDataServiceConfig, HttpUrlGenerator, EntityDefinitionService, EntityDefinition } from "@ngrx/data";
import { Update } from "@ngrx/entity";
import { forkJoin, iif, Observable, of } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { CrudAdaptorPluginManager } from '../services/crud-adaptor-plugin-manager.service';
import { map, switchMap } from "rxjs/operators";
import * as uuid from 'uuid';
import { CrudEntityConfiguration, CrudEntityMetadata } from "../models/entity-metadata.models";
import { CrudOperations } from '../models/crud.models';
import { Param } from "dparam";
// import { Param } from "dparam";

export class CrudDataService<T> extends DefaultDataService<T> implements EntityCollectionDataService<T> {

  constructor(
    entityName: string,
    protected http: HttpClient,
    protected httpUrlGenerator: HttpUrlGenerator,
    protected crud: CrudAdaptorPluginManager,
    protected entityDefinitionService: EntityDefinitionService,
    config?: DefaultDataServiceConfig
  ) {
    super(entityName, http, httpUrlGenerator, config);
  }

  add(object: T): Observable<T> {

    // return of(entity);

    const metadata = this.entityDefinitionService.getDefinition(this.entityName).metadata as CrudEntityMetadata<any, {}>;
    // console.log('crud def');
    // console.log(metadata.crud);

    // quick and dirty add an id. This needs to be more flexible.
    // (object as any).id = uuid.v4(); // or require called to set id?

    return this.evaluatePlugins({ object, plugins: metadata.crud, op: 'create' });

    /*const adaptors = Object.keys(metadata.crud);
    const operations$ = adaptors.map(
      a => this.crud.getPlugin(a).pipe(
        map(p => ({ p, params: metadata.crud[a].params ? Object.keys(metadata.crud[a].params).reduce((p, name) => ({ ...p, [name]: new Param({ flags: [], mapping: { type: 'static', value: metadata.crud[a].params[name], context: undefined, testValue: metadata.crud[a].params[name] } }) }), {}) : {} })),
        switchMap(({ p, params }) => p.create({ object, params, identity: ({ object }) => of({ identity: object.id }) })),
        switchMap(res => iif(
          () => metadata.crud[a].plugins && Object.keys(metadata.crud[a].plugins).length !== 0,
          metadata.crud[a].plugins && Object.keys(metadata.crud[a].plugins).length !== 0 ? this.evaluatePlugins({ plugins: crud[a].plugins, res }) : of (res),
          of(res)
        ))
      )
    );

    return forkJoin(operations$).pipe(
      map(() => object)
    );*/

    /* 
    const plugin = Object.keys(metadata.crud).pop();

    execute each defined plugin, first convert params object to true param array and pass to operation.

    return this.crud.getPlugin('aws_s3_entity').pipe(
      switchMap(p => p.create({ object: entity, identity: ({ object }) => of({ identity: uuid.v4() }) })),
      map(() => entity)
    );*/

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

  evaluatePlugins({ object, plugins, op, parentObject }: { object: any, plugins: CrudEntityConfiguration, op: CrudOperations, parentObject?: any }): Observable<T> {
    const adaptors = Object.keys(plugins);
    const operations$ = adaptors.map(
      a => this.crud.getPlugin(a).pipe(
        map(p => ({ p, params: plugins[a].params ? Object.keys(plugins[a].params).reduce((p, name) => ({ ...p, [name]: new Param({ flags: [], mapping: { type: 'static', value: plugins[a].params[name], context: undefined, testValue: plugins[a].params[name] } }) }), {}) : {} })),
        switchMap(({ p, params }) => p.create({ object, parentObject, params, identity: ({ object, parentObject }) => of({ identity: object.id ? object.id : parentObject ? parentObject.id : undefined }) })),
        switchMap(res => iif(
          () => plugins[a].plugins && Object.keys(plugins[a].plugins).length !== 0,
          plugins[a].plugins && Object.keys(plugins[a].plugins).length !== 0 ? this.evaluatePlugins({ plugins: plugins[a].plugins, object: res.entity ? res.entity : object, parentObject: res.originalEntity ? res.originalEntity : object, op }) : of (res),
          of(res)
        ))
      )
    );
    return forkJoin(operations$).pipe(
      map(() => object)
    );
  }

}