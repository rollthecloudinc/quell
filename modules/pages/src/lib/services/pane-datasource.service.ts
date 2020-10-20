import { Injectable } from '@angular/core';
import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import { BehaviorSubject, Observable, Subscription, Subject } from 'rxjs';
import { Pane } from '../models/page.models';

@Injectable()
export class PaneDatasourceService extends DataSource<Pane> {

  pageChange$ = new Subject<number>();
  private dataStream = new BehaviorSubject<Array<Pane>>([]);
  private subscription = new Subscription();
  private pageSize = 9;
  private lastPage = 0;
  private paneItems: Array<Pane> = [];

  constructor() {
    super();
  }

  set panes(panes: Array<Pane>) {
    this.paneItems = [ ...this.paneItems, ...panes];
    // console.log(this.paneItems);
    this.dataStream.next(this.paneItems);
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

  disconnect(collectionViewer: CollectionViewer): void {
    this.subscription.unsubscribe();
  }
}
