import { Injectable } from '@angular/core';
import { EntityCache, EntityCollectionService, EntityServices } from '@ngrx/data';
import { createSelector, select, Store } from '@ngrx/store';
import { AttributeSerializerService } from 'attributes';
import { ContextResolver, ContextPlugin } from 'context';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { GlobalState } from '../models/state.models';

@Injectable()
export class StateContextResolver implements ContextResolver {

  get entityCollectionService(): EntityCollectionService<GlobalState> {
    return this.es.getEntityCollectionService('GlobalState');
  }

  constructor(
    private store: Store<EntityCache>,
    private attributeSerializer: AttributeSerializerService,
    private es: EntityServices
  ) {
  }

  resolve(ctx: ContextPlugin, data?: any): Observable<any> {

    const selectById = (id: string) => createSelector(
      this.entityCollectionService.selectors$.entities,
      entities => entities[id] ? entities[id] : undefined
    );

    console.log('hookup globalstate');
    console.log(data)

    return data.id ? this.store.pipe(
      select(selectById(data.id)),
      map(gs => this.attributeSerializer.deserialize(gs.value)),
      map(value => value.root ? value.root : value),
      tap(v => {
        console.log('resolve globalstate');
        console.log(v);
      })
    ) : of(data.value ? data.value : {});

    //return of(data.state);
    /*return this.entityServices.getEntityCollectionService('GlobalState').entities$.pipe(
      this.entityServices.getEntityCollectionService('GlobalState').selectors;
    );*/
  }

}

