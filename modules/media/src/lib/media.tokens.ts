import { InjectionToken } from '@angular/core';

import { MediaSettings } from './models/media.models';

export const MEDIA_SETTINGS = new InjectionToken<MediaSettings>('Media Settings');
