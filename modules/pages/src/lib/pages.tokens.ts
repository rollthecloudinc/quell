import { InjectionToken } from '@angular/core';

import { PagesSettings } from './models/pages.models';

export const PAGES_SETTINGS = new InjectionToken<PagesSettings>('PagesSettings');