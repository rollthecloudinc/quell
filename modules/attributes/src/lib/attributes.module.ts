import { NgModule, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClientJsonpModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '@rollthecloudinc/material';
// import { CitiesModule } from 'cities';
import { AttributesBuilderComponent } from './components/attributes-builder/attributes-builder.component';
import { AttributeWidgetComponent } from './components/attribute-widget/attribute-widget.component';
import { AttributeWidgetDirective } from './directives/attribute-widget.directive';
import { TextWidgetComponent } from './widgets/text-widget/text-widget.component';
import { ATTRIBUTE_WIDGET } from './attribute.tokens';
import { MinMaxWidgetComponent } from './widgets/min-max-widget/min-max-widget.component';
import { AttributePipe } from './pipes/attribute.pipe';
// import { YmmSelectorComponent } from './widgets/ymm-selector/ymm-selector.component';
import * as attrFactories from './attributes.factories';
// import { CitySelectorComponent } from './widgets/city-selector/city-selector.component';
import { AttributeWidget } from './models/attributes.models';
import { WidgetPluginManager } from './services/widget-plugin-manager.service';

@NgModule({
    imports: [CommonModule, ReactiveFormsModule, MaterialModule, /*HttpClientModule,*/ HttpClientJsonpModule /*, CitiesModule */],
    declarations: [
        AttributesBuilderComponent,
        AttributeWidgetComponent,
        AttributeWidgetDirective,
        TextWidgetComponent,
        MinMaxWidgetComponent,
        AttributePipe
        /*, YmmSelectorComponent, CitySelectorComponent*/
    ],
    exports: [AttributesBuilderComponent, AttributePipe, AttributeWidgetComponent],
    providers: [
        {
            provide: ATTRIBUTE_WIDGET,
            useFactory: attrFactories.textFactory,
            multi: true
        },
        {
            provide: ATTRIBUTE_WIDGET,
            useFactory: attrFactories.minmaxFactory,
            multi: true
        },
        /*{
          provide: ATTRIBUTE_WIDGET,
          useFactory: attrFactories.ymmFactory,
          multi: true
        },
        {
          provide: ATTRIBUTE_WIDGET,
          useFactory: attrFactories.cityFactory,
          multi: true
        }*/
    ]
})
export class AttributesModule {
  constructor(
    @Inject(ATTRIBUTE_WIDGET) widgetPlugins: Array<AttributeWidget<string>>,
    wpm: WidgetPluginManager
  ) {
    widgetPlugins.forEach(p => wpm.register(p));
  }
}
