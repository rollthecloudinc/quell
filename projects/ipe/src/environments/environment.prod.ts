// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: true,
  apiGatewaySettings: {
    endpointUrl: 'https://classifieds-dev.azurewebsites.net',
  },
  mediaSettings: {
    endpointUrl: 'https://classifieds-dev.azurewebsites.net/media',
    cloudinaryUrl: 'https://api.cloudinary.com/v1_1/dj4vvkgzw',
    uploadPreset: 'i0hm4opm',
    imageUrl: 'https://res.cloudinary.com/dj4vvkgzw'
  },
  loggingSettings: {
    endpointUrl: "https://classifieds-dev.azurewebsites.net/logging"
  },
  chatSettings: {
    endpointUrl: "https://classifieds-dev.azurewebsites.net/chat"
  },
  oktaSettings: {
    redirectUri: 'https://classifieds-ui.com/implicit/callback',
    clientId: '0oa4qw6inqps2eUgC4x6',
  },
  clientSettings: {
    authority: 'https://localhost:44392',
    client_id: 'classifieds_spa',
    redirect_uri: 'http://localhost:4200/auth-callback',
    silent_redirect_uri: 'http://localhost:4200/silent-refresh.html',
    response_type: "code",
    scope:"openid profile ads_api media_api chat IdentityServerApi taxonomy_api api_gateway",
    filterProtocolClaims: true,
    loadUserInfo: true,
    automaticSilentRenew: true
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
