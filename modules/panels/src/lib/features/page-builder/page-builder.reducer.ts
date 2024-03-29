import { Action, createReducer, on } from '@ngrx/store';
import * as PageBuilderActions from './page-builder.actions';
import { Dataset } from '@rollthecloudinc/datasource';
import { PanelPageForm } from '../../models/form.models';
import { PanelPageStateSlice } from '../../models/page.models';
import { PanelPage } from '../../models/panels.models';

export const pageBuilderFeatureKey = 'pageBuilder';

export interface State {
  dataTags: Array<string>;
  datasets: Array<Array<Dataset>>;
  pageInfo: PanelPageStateSlice;
  formNames: Array<string>;
  forms: Array<PanelPageForm>;
  page: PanelPage;
  selectionPath: Array<number>;
}

export interface PageBuilderPartialState {
  readonly [pageBuilderFeatureKey]: State;
}

export const initialState: State = {
  dataTags: [],
  datasets: [],
  pageInfo: undefined,
  formNames: [],
  forms: [],
  page: undefined,
  selectionPath: []
};

const pageBuilderReducer = createReducer(
  initialState,
  on(PageBuilderActions.loadRestDataSuccess, (state, action) => {
    const tagIndex = state.dataTags.findIndex(t => t === action.tag);
    if(tagIndex > -1 && state.forms[tagIndex] !== undefined) {
      // @todo: fix this - causing error - this is why rest was not completing when same tag was used.
      const newState = { ...state };
      newState.datasets[tagIndex].push(action.data);
      return newState;
    } else {
      return { ...state, dataTags: [ ...state.dataTags, action.tag ], datasets: [ ...state.datasets, [ action.data ] ] };
    }
  }),
  on(PageBuilderActions.setForm, (state, action) => {
    const nameIndex = state.formNames.findIndex(n => n === action.name);
    if(nameIndex > -1 && state.forms[nameIndex] !== undefined) {
      return { ...state, forms: state.forms.map((f, i) => i === nameIndex ? action.form : f) };
    } else {
      return { ...state, formNames: [ ...state.formNames, action.name ], forms: [ ...state.forms, action.form ] };
    }
  }),
  on(PageBuilderActions.setPageInfo, (state, action ) => {
    return ({ ...state, pageInfo: action.info !== undefined ? new PanelPageStateSlice(action.info) : undefined });
  }),
  on(PageBuilderActions.setPage, (state, action ) => {
    return ({ ...state, page: action.page !== undefined ? new PanelPage(action.page) : undefined });
  }),
  on(PageBuilderActions.setSelectionPath, (state, action ) => {
    return ({ ...state, selectionPath: action.path !== undefined ? action.path : [] });
  })
);

export function reducer(state: State | undefined, action: Action) {
  return pageBuilderReducer(state, action);
}
