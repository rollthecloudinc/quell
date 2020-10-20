import { InjectionToken } from '@angular/core';

import { ContextPlugin } from './models/context.models';

export const CONTEXT_PLUGIN = new InjectionToken<ContextPlugin>('ContextPlugin');
