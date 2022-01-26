import { InjectionToken } from "@angular/core";
import { PanelsSettings } from './models/panels.models';
import { StylePlugin } from "./models/style.models";

export const STYLE_PLUGIN = new InjectionToken<StylePlugin>('StylePlugin');
export const PANELS_SETTINGS = new InjectionToken<PanelsSettings>('PanelsSettings');