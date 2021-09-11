import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromPageBuilder from './page-builder.reducer';

export const selectPageBuilderState = createFeatureSelector<fromPageBuilder.State>(
  fromPageBuilder.pageBuilderFeatureKey
);

export const selectContentInstance = createSelector(selectPageBuilderState, state => state.contentInstance);

export const selectDataset = (tag: string) => createSelector(selectPageBuilderState, state => {
  const index = state.dataTags.findIndex(t => t === tag);
  if(index > -1) {
    return state.datasets[index][state.datasets[index].length - 1];
  } else {
    return undefined;
  }
});

export const selectPageInfo = createSelector(selectPageBuilderState, state => state.pageInfo);
export const selectPage = createSelector(selectPageBuilderState, state => state.page);
export const selectSelectionPath = createSelector(selectPageBuilderState, state => state.selectionPath);

export const selectFormNames = createSelector(selectPageBuilderState, state => state.formNames);
export const selectForms = createSelector(selectPageBuilderState, state => state.forms);

export const selectForm = createSelector(selectFormNames, selectForms, (names, forms, props) => {
  const index =  names.findIndex(n => n === props.name);
  if(index > -1) {
    return forms[index];
  } else {
    return undefined;
  }
});

/*export const selectForm = () => createSelector(selectPageBuilderState, (, props) => {
  const index = state.formNames.findIndex(n => n === props.name);
  if(index > -1) {
    return state.forms[index];
  } else {
    return undefined;
  }
});*/
