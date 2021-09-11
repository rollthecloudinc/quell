import { Injectable } from '@angular/core';

import { select, Store } from '@ngrx/store';
import { ContentInstance } from 'content';
import { Rest } from 'datasource';

import { PageBuilderPartialState } from './page-builder.reducer';
import { selectContentInstance, selectPageInfo, selectForm, selectFormNames, selectPage, selectSelectionPath } from './page-builder.selectors';
import * as pageBuilderActions from './page-builder.actions';
import { PanelPageForm } from '../../models/form.models';
import { PanelPageStateSlice } from '../../models/page.models';
import { PanelPage } from 'panels';

@Injectable({
  providedIn: 'root'
})
export class PageBuilderFacade {
  getContentInstance$ = this.store.pipe(select(selectContentInstance));
  getPageInfo$ = this.store.pipe(select(selectPageInfo));
  getPage$ = this.store.pipe(select(selectPage));
  getSelectionPath$ = this.store.pipe(select(selectSelectionPath));
  getFormNames$ = this.store.pipe(select(selectFormNames));
  getForm$ = (name: string) => this.store.pipe(select(selectForm, { name }));
  constructor(private store: Store<PageBuilderPartialState>) {}
  addContentInstance(contentInstance: ContentInstance) {
    this.store.dispatch(pageBuilderActions.addContentInstance({ contentInstance }));
  }
  loadRestData(tag: string, rest: Rest) {
    this.store.dispatch(pageBuilderActions.loadRestData({ tag, rest }));
  }
  setPageInfo(info: PanelPageStateSlice) {
    this.store.dispatch(pageBuilderActions.setPageInfo({ info }));
  }
  setPage(page: PanelPage) {
    this.store.dispatch(pageBuilderActions.setPage({ page }));
  }
  setSelectionPath(path: Array<number>) {
    this.store.dispatch(pageBuilderActions.setSelectionPath({ path }));
  }
  setForm(name: string, form: PanelPageForm) {
    this.store.dispatch(pageBuilderActions.setForm({ name, form }));
  }
}
