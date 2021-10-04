import { BrowserModule, BrowserTransferStateModule } from '@angular/platform-browser';
import { NgModule, ErrorHandler, APP_INITIALIZER,  SecurityContext } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS, HttpClientJsonpModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// import { NxModule } from '@nrwl/angular';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NgxJsonViewerModule } from 'ngx-json-viewer';
// tslint:disable-next-line:nx-enforce-module-boundaries
// import { AD_SETTINGS, AdSettings } from '@classifieds-ui/ads';
import { AuthModule, LogoutInterceptor} from 'auth';
import { OidcModule, TokenInterceptor, CLIENT_SETTINGS, ClientSettings } from 'oidc';
import { MediaModule, MediaSettings, MEDIA_SETTINGS } from 'media';
import { UtilsModule /*, CorrelationInterceptor */, SITE_NAME } from 'utils';
import { MaterialModule } from 'material';
// import { LOGGING_SETTINGS, LoggingSettings, LoggingModule, HttpErrorInterceptor, GlobalErrorHandler } from '@classifieds-ui/logging';
import { TokenModule } from 'token';
import { ContextModule } from 'context';
import { ContentModule } from 'content';
import { AliasModule, CatchAllGuard, CatchAllRouterComponent } from 'alias';
import { PagealiasModule } from 'pagealias';
import { PanelsModule } from 'panels';
import { FormlyModule } from 'formly';
import { BridgeModule } from 'bridge';
import { StateModule } from 'state';
// import { CHAT_SETTINGS, ChatSettings } from '@classifieds-ui/chat';
// tslint:disable-next-line:nx-enforce-module-boundaries
// import { PROFILE_SETTINGS, ProfileSettings } from '@classifieds-ui/profiles';
// import { OktaAuthModule, OktaCallbackComponent, OKTA_CONFIG } from '@okta/okta-angular';
// import { UserManager } from 'oidc-client';
// import { NbA11yModule } from '@nebular/theme';
// import { JsonschemaModule } from '@classifieds-ui/jsonschema';
// import { TAXONOMY_SETTINGS, TaxonomySettings } from '@classifieds-ui/taxonomy';
import { MarkdownModule, MarkedOptions, MarkedRenderer } from 'ngx-markdown';

import { AppComponent } from './app.component';
import { RouterModule } from '@angular/router';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { environment } from '../environments/environment';
import { StoreRouterConnectingModule, MinimalRouterStateSerializer } from '@ngrx/router-store';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

/*import { AuthCallbackComponent } from './components/auth-callback/auth-callback.component';
import { AppHeaderComponent } from './components/app-header/app-header.component';
import { AppFooterComponent } from './components/app-footer/app-footer.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { HomeComponent } from './components/home/home.component';*/
import { EntityDataModule, DefaultDataServiceConfig } from '@ngrx/data';
import { reducers, metaReducers } from './reducers';
import { AuthCallbackComponent } from 'auth';
import { PlaygroundComponent } from './components/playground/playground.component';

const routes = [
  { path: 'auth-callback', component: AuthCallbackComponent },
  { path: 'playground', component: PlaygroundComponent },
  // { path: 'implicit/callback', component: OktaCallbackComponent },
  // { path: 'chat', loadChildren: () => import('@classifieds-ui/chat').then(m => m.ChatModule) },
  // { path: 'ads', loadChildren: () => import('@classifieds-ui/ads').then(m => m.AdsModule) },
  // { path: 'vocabularies', loadChildren: () => import('@classifieds-ui/vocabulary').then(m => m.VocabularyModule) },
  // { path: 'profiles', loadChildren: () => import('@classifieds-ui/profiles').then(m => m.ProfilesModule) },
  /*{ path: 'pages', loadChildren: () => {
    return import('pages').then(m => m.PagesModule);
  } },*/
  // { path: '', children: [] /*, component: HomeComponent*/ },
  //{ path: '**', component: NotFoundComponent }
  { path: '**', component: CatchAllRouterComponent, canActivate: [ CatchAllGuard ] }
  //{ path: '', redirectTo: 'pages', pathMatch: "full" }
];

// @todo: just get this to work for now deal with actual endpoints later.
const defaultDataServiceConfig: DefaultDataServiceConfig = {
  // root: 'https://localhost:44340', // hard coded to taxonomy for now -- api gateway will prevent the need for custom code to change this per entity.
  // root: 'https://classifieds-dev.azurewebsites.net',
  root: environment.apiGatewaySettings.endpointUrl,
  timeout: 20000, // request timeout
}

/*const oktaConfig = {
  issuer: 'https://dev-585865.okta.com/oauth2/default',
  redirectUri: environment.oktaSettings.redirectUri,
  clientId: environment.oktaSettings.clientId,
  pkce: true,
  scopes: ['openid', 'profile', 'ads_api', 'chat', 'taxonomy_api', 'api_gateway']
}*/

export function markedOptionsFactory(): MarkedOptions {
  const renderer = new MarkedRenderer();
  renderer.link = (href: string, title: string, text: string) => {
    if(text === 'page') {
      return `<classifieds-ui-panel-page id="${href}"></classifieds-ui-panel-page>`;
    } else {
      return `<classifieds-ui-page-router-link href="${href}" text="${text}"></classifieds-ui-page-router-link>`;
    }
  };
  return {
    renderer,
  };
}

@NgModule({
  declarations: [AppComponent, PlaygroundComponent /*, AuthCallbackComponent, AppHeaderComponent, AppFooterComponent, HomeComponent, NotFoundComponent */],
  imports: [
    BrowserModule.withServerTransition({ appId: 'serverApp' }),
    CommonModule,
    HttpClientModule,
    HttpClientJsonpModule,
    BrowserTransferStateModule ,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    FlexLayoutModule,
    NgxJsonViewerModule,
    MarkdownModule.forRoot({
      sanitize: SecurityContext.NONE,
      markedOptions: {
        provide: MarkedOptions,
        useFactory: markedOptionsFactory,
      },
    }),
    // NbA11yModule.forRoot(),
    RouterModule.forRoot(routes, { initialNavigation: 'enabled' }),
    StoreDevtoolsModule.instrument({
      maxAge: 25,
      logOnly: environment.production
    }),
    StoreRouterConnectingModule.forRoot({
      serializer: MinimalRouterStateSerializer
    }),
    StoreModule.forRoot(
      reducers,
      {
        metaReducers,
        runtimeChecks: {
          strictActionImmutability: true,
          strictStateImmutability: true
        }
      }
    ),
    EffectsModule.forRoot([]),
    !environment.production ? StoreDevtoolsModule.instrument() : [],
    BridgeModule,
    StateModule,
    MaterialModule,
    UtilsModule,
    // LoggingModule,
    TokenModule,
    ContentModule,
    ContextModule,
    AuthModule.forRoot(),
    OidcModule.forRoot(),
    MediaModule,
    // NxModule.forRoot(),
    EntityDataModule.forRoot({}),
    AliasModule,
    PanelsModule,
    PagealiasModule,
    FormlyModule
    // JsonschemaModule
    // OktaAuthModule
  ],
  providers: [
    // { provide: ErrorHandler, useClass: GlobalErrorHandler },

    // okta auth
    //{ provide: OKTA_CONFIG, useValue: oktaConfig },
    CatchAllGuard,

    { provide: SITE_NAME, useValue: environment.site },

    { provide: CLIENT_SETTINGS, useValue: new ClientSettings(environment.clientSettings) },
    { provide: MEDIA_SETTINGS, useValue: new MediaSettings(environment.mediaSettings) },
    // { provide: LOGGING_SETTINGS, useValue: new LoggingSettings(environment.loggingSettings) },
    // { provide: AD_SETTINGS, useValue: new AdSettings(environment.adSettings) },
    // { provide: TAXONOMY_SETTINGS, useValue: new TaxonomySettings(environment.taxonomySettings) },
    // { provide: PROFILE_SETTINGS, useValue: new ProfileSettings(environment.profileSettings) },
    // { provide: CHAT_SETTINGS, useValue: new ChatSettings(environment.chatSettings) },

    // There is no way to prioritize interceptors so order can be important.
    // { provide: HTTP_INTERCEPTORS, useClass: CorrelationInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true },
    // { provide: HTTP_INTERCEPTORS, useClass: HttpErrorInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: LogoutInterceptor, multi: true },

    { provide: DefaultDataServiceConfig, useValue: defaultDataServiceConfig }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
