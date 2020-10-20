import { InjectionToken } from '@angular/core';

import { StylePlugin } from './models/style.models';

export const STYLE_PLUGIN = new InjectionToken<StylePlugin>('StylePlugin');
