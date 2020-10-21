import { InjectionToken } from '@angular/core';

import { ClientSettings } from './models/auth.models';

export const CLIENT_SETTINGS = new InjectionToken<ClientSettings>('ClientSettings');
