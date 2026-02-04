import { UIRole } from '@rollthecloudinc/utils';

export interface SidenavRole extends UIRole {
  open(): void;
  close(): void;
  toggle(): void;
}