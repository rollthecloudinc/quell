import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MaterialModule } from 'material';
import { CONTEXT_PLUGIN } from './context.tokens';
import { routeContextFactory } from './context.factories';
import { RouteResolver } from './resolvers/route.resolver';
import { ContextFormComponent } from './components/context-form/context-form.component';
import { ContextEditorHostDirective } from './directives/context-editor-host.directive';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, FormsModule, MaterialModule, FlexLayoutModule],
  providers: [
    { provide: RouteResolver, useClass: RouteResolver },
    { provide: CONTEXT_PLUGIN, useFactory: routeContextFactory, multi: true, deps: [ RouteResolver ] }
  ],
  declarations: [ContextFormComponent, ContextEditorHostDirective],
  exports: [ContextFormComponent]
})
export class ContextModule {}
