import { InjectionToken } from '@angular/core';

import { CognitoSettings } from './models/awcog.models';

export const COGNITO_SETTINGS = new InjectionToken<CognitoSettings>('CognitoSettings');
