import { createAction, props } from '@ngrx/store';
import { ContentInstance } from 'content';
import { Rest, Dataset } from 'datasource';
import { PanelPageForm } from '../../models/form.models';
import { PanelPageStateSlice } from '../../models/page.models';

export const addContentInstance = createAction(
  '[PageBuilder] Add Content Instance',
  props<{ contentInstance: ContentInstance }>()
);

export const loadRestData = createAction(
  '[PageBuilder] Load Rest Data',
  props<{ tag: string; rest: Rest }>()
);

export const loadRestDataSuccess = createAction(
  '[PageBuilder] Load Rest Data Success',
  props<{ tag: string, data: Dataset }>()
);

export const loadRestDataError = createAction(
  '[PageBuilder] Load Rest Data Error',
  props<{ tag: string }>()
);

export const setPageInfo = createAction(
  '[PageBuilder] Set Page Info',
  props<{ info: PanelPageStateSlice }>()
);

export const setForm = createAction(
  '[PageBuilder] Set Form',
  props<{ name: string; form: PanelPageForm }>()
);




