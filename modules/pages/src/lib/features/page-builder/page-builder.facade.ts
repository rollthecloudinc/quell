import { Injectable } from '@angular/core';

import { select, Store } from '@ngrx/store';
import { ContentInstance } from 'content';

import { PageBuilderPartialState } from './page-builder.reducer';
import { selectContentInstance, selectPageInfo, selectForm, selectFormNames } from './page-builder.selectors';
import * as pageBuilderActions from './page-builder.actions';
import { Rest } from '../../models/datasource.models';
import { PanelPageForm } from '../../models/form.models';
import { PanelPageStateSlice } from '../../models/page.models';

@Injectable({
  providedIn: 'root'
})
export class PageBuilderFacade {
  getContentInstance$ = this.store.pipe(select(selectContentInstance));
  getPageInfo$ = this.store.pipe(select(selectPageInfo));
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
  setForm(name: string, form: PanelPageForm) {
    this.store.dispatch(pageBuilderActions.setForm({ name, form }));
  }
}
