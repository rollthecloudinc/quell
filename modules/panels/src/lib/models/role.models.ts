import { UIRole, Fillable } from '@rollthecloudinc/utils';

export interface SidenavRole extends UIRole {
  open(): void;
  close(): void;
  toggle(): void;
  refresh(): void;
}

export interface UIEditorRole<T={}> extends Fillable<T> {
  submit(): void
}