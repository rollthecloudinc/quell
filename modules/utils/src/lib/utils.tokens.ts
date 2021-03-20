import { InjectionToken } from '@angular/core';
import { Type } from '@angular/core';

export const EMBEDDABLE_COMPONENT = new InjectionToken<Type<any>>('EmbeddableComponent');

export const SITE_NAME = new InjectionToken<string>('Site Name')