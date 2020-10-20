import { InjectionToken } from '@angular/core';

import { ContentPlugin } from './models/content.models';

export const CONTENT_PLUGIN = new InjectionToken<ContentPlugin>('ContentPlugin');
