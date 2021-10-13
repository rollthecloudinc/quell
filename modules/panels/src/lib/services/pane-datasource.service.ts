import { Injectable } from '@angular/core';
import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import { BehaviorSubject, Observable, Subscription, Subject } from 'rxjs';
import { Pane } from '../models/panels.models';

@Injectable()
export class PaneDatasourceService extends DataSource<Pane> {

  pageChange$ = new Subject<number>();
  pageSize = 20;
  private dataStream = new BehaviorSubject<Array<Pane>>([]);
  private subscription = new Subscription();
  private lastPage = 0;
  private paneItems: Array<Pane> = [];
  // private fetchedPages = new Set<number>();

  constructor() {
    super();
  }

  set panes(panes: Array<Pane>) {
    this.paneItems = [ ...this.paneItems, ...panes];
    // console.log(this.paneItems);
    this.dataStream.next(this.paneItems);
    // this.dataStream.next(panes);
  }

  connect(collectionViewer: CollectionViewer): Observable<Array<any>> {
    this.subscription.add(collectionViewer.viewChange.subscribe(range => {
      const currentPage = Math.ceil((range.end + 1) / this.pageSize);
      if (currentPage > this.lastPage) {
        this.lastPage = currentPage;
        this.pageChange$.next(currentPage);
      }
    }));
    return this.dataStream;
  }

  /*connect(collectionViewer: CollectionViewer): Observable<Array<any>> {
    this.subscription.add(collectionViewer.viewChange.subscribe(range => {
      const startPage = Math.floor(range.start / this.pageSize);
      const endPage = Math.floor((range.end - 1) / this.pageSize);
      for (let i = startPage; i <= endPage; i++) {
        if (this.fetchedPages.has(i)) {
          return;
        }
        console.log(`fetch page ${i}`);
        this.pageChange$.next(i);
        this.fetchedPages.add(i);
      }
    }));
    return this.dataStream;
  }*/

  disconnect(collectionViewer: CollectionViewer): void {
    this.subscription.unsubscribe();
  }

}
