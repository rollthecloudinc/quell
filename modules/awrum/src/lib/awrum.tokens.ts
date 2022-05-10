import { InjectionToken } from '@angular/core';

import { CloudwatchRumSettings } from './models/rum.models';

export const CLOUDWATCH_RUM_SETTINGS = new InjectionToken<CloudwatchRumSettings>('RumSettings');
