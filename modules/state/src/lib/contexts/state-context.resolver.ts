import { Injectable } from '@angular/core';
import { EntityCache, EntityCollection, EntityCollectionService, EntityServices } from '@ngrx/data';
import { createSelector, select, Store } from '@ngrx/store';
import { AttributeSerializerService } from '@rollthecloudinc/attributes';
import { ContextResolver, ContextPlugin } from '@rollthecloudinc/context';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { GlobalState } from '../models/state.models';

@Injectable()
export class StateContextResolver implements ContextResolver {

  get entityCollectionService(): EntityCollectionService<GlobalState> {
    return this.es.getEntityCollectionService('GlobalState');
  }

  constructor(
    private attributeSerializer: AttributeSerializerService,
    private es: EntityServices
  ) {
  }

  resolve(ctx: ContextPlugin, data?: any, meta?: Map<string, any>): Observable<any> {
    // return of({});

    const selectEntities = (entities: EntityCollection<GlobalState>) => entities.entities;

    const selectById = (id: string) => createSelector(
      selectEntities,
      entities => entities[id] ? entities[id] : undefined
    );

    console.log('hookup globalstate');
    console.log(data)

    const name = meta && meta.has('name') && meta.get('name') && meta.get('name') !== null && meta.get('name') !== '' ? meta.get('name') : undefined;

    return name ? this.entityCollectionService.collection$.pipe(
      select(selectById(name)),
      map(gs => gs ? this.attributeSerializer.deserialize(gs.value) : data.value ? data.value : {}),
      map(value => value.root ? value.root : value),
      tap(v => {
        console.log('resolve globalstate');
        console.log(v);
      })
    ) : of(data.value ? data.value : {}).pipe(
      tap(v => {
        console.log('resolve default globalstate');
        console.log(v);
      })
    );

    //return of(data.state);
    /*return this.entityServices.getEntityCollectionService('GlobalState').entities$.pipe(
      this.entityServices.getEntityCollectionService('GlobalState').selectors;
    );*/
  }

}

