import { EntityCollectionDataService, QueryParams } from "@ngrx/data";
import { Update } from "@ngrx/entity";
import { Observable, of } from "rxjs";

export class NoopDataService<T> implements EntityCollectionDataService<T> {
  readonly name: string;
  private entities = new Map<number | string, T>();
  constructor(name: string) {
    this.name = name;
  }
  add(entity: T): Observable<T> {
    return of(entity);
  }
  delete(id: number | string): Observable<string | number> {
    this.entities.delete(id);
    return of(id);
  }
  getAll(): Observable<Array<T>> {
    const flat: Array<T> = [];
    this.entities.forEach(v => {
      flat.push(v);
    });
    return of(flat);
  }
  getById(id: any): Observable<T> {
    return of(this.entities.get(id));
  }
  getWithQuery(params: QueryParams | string): Observable<Array<T>> {
    const flat: Array<T> = [];
    this.entities.forEach(v => {
      flat.push(v);
    });
    return of(flat);
  }
  update(update: Update<T>): Observable<T> {
    return of(undefined);
  }
  upsert(entity: T): Observable<T> {
    //this.entities.set(entity.id, entity);
    return of(entity);
  }
}