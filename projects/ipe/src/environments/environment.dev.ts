// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.
const signingKeys = {
  "keys": [
  {
  "alg": "RS256",
  "e": "AQAB",
  "kid": "LFfHKQ51C81E+ByYd/wucwrvfiEnYJQtJvb4GHbalFQ=",
  "kty": "RSA",
  "n": "gijyjUXIzkAPofeaM7JCAsuLHLc_GP3of-NT8ARjSTTMif-wqJeNww4MJkvRYzfL6mL_owVZgD37O4Dd81jBLY6iEyi6hxHYTUuXR7mYkQ2008Fp3m45wztUKWeeNgzsvuR01STkkwmuf7afkQXJUlHts8eT47Dqc4mrKA3vcHYG4vJXmvtjQT-IirkA-yU36TXyd1TPOetdwlmFOcSYfL4CW7ZZfVg1dCvT1T50mO1AaQDMcA8S3fVfROGW36hjiB8r9q5zQrrfBLTMPSVpn85LscVLbYUxJL9yLygiD4UTCXw7Y1hiE2tDL2nmy6PHumylNf8yj5I7N56Kz4cwtQ",
  "use": "sig"
  },
  {
  "alg": "RS256",
  "e": "AQAB",
  "kid": "UNTk4hVhUrq0k8uAGvDYs/w0g/iW+b9PweObMbM6S/w=",
  "kty": "RSA",
  "n": "g7Z-JKiovH7ZnwK1o8hsiLf4GfxA9w11RsQK3yQWG3xR__qKbkvxKxhn3Xt5QsUSo8nhiwWtsjUTyVxRO7WJlCjSHGztvYhoYIlwSL8Mqtf3Plg6CrJoDhq7CZDe_TNeQczfBI8k1w5U6n4h5G-e4Fa41nH-qXrDh2L7onTFKSzZDJRCELmh64ur5RmU6kuhwrejwS4YXuz4gKQRcTuDu9AXH7A7cNO5EF_sVRy8hkFtKCPO-mgwJ5S_e5_Y5gleJRpMZnzWmBv_-GpwO5V9XzxBr5s1O9HqyBMXR1pKU_YykeP7PvukEDpyr8UXu-2drzq-oHzXHDInNHjYPLx3BQ",
  "use": "sig"
  }
  ]
};

export const environment = {
  production: false,
  apiGatewaySettings: {
    endpointUrl: 'https://gzm61h96d7.execute-api.us-east-1.amazonaws.com/dev',
  },
  mediaSettings: {
    endpointUrl: 'https://gzm61h96d7.execute-api.us-east-1.amazonaws.com/dev/media',
    cloudinaryUrl: 'https://api.cloudinary.com/v1_1/dj4vvkgzw',
    uploadPreset: 'i0hm4opm',
    imageUrl: 'https://d2o66qxp1qwfb9.cloudfront.net'
  },
  adSettings: {
    adUrl: 'https://d2o66qxp1qwfb9.cloudfront.net/ads'
  },
  profileSettings: {
    profileUrl: 'https://d2o66qxp1qwfb9.cloudfront.net/profiles'
  },
  loggingSettings: {
    endpointUrl: "https://classifieds-dev.azurewebsites.net/logging"
  },
  chatSettings: {
    endpointUrl: "https://classifieds-dev.azurewebsites.net/chat"
  },
  oktaSettings: {
    redirectUri: 'https://1amv4ijcf9.execute-api.us-east-1.amazonaws.com/dev/implicit/callback',
    clientId: '0oa4qw6inqps2eUgC4x6',
  },
  /*clientSettings: {
    authority: 'https://localhost:44392',
    client_id: 'classifieds_spa',
    redirect_uri: 'http://localhost:4200/auth-callback',
    silent_redirect_uri: 'http://localhost:4200/silent-refresh.html',
    response_type: "code",
    scope:"openid profile ads_api media_api chat IdentityServerApi taxonomy_api api_gateway",
    filterProtocolClaims: true,
    loadUserInfo: true,
    automaticSilentRenew: true
  }*/
  clientSettings: {
    authority: 'https://classifieds-ui-dev.auth.us-east-1.amazoncognito.com',
    client_id: '3lkidn79q4jq8nahkecsguleij',
    redirect_uri: 'http://localhost:4000/auth-callback',
    silent_redirect_uri: 'http://localhost:4000/silent-refresh.html',
    response_type: "code",
    scope:"openid profile aws.cognito.signin.user.admin ads_api/ads_api taxonomy_api/taxonomy_api chat/chat media_api/media_api profiles_api/profiles_api", /*'ads_api media_api chat IdentityServerApi taxonomy_api api_gateway",*/
    filterProtocolClaims: true,
    loadUserInfo: true,
    automaticSilentRenew: true,
    stateStore: undefined,
    userStore: undefined,
    metadata: {
      issuer: "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_z8PhK3D8V",
      authorization_endpoint: "https://classifieds-ui-dev.auth.us-east-1.amazoncognito.com/oauth2/authorize",
      userinfo_endpoint: "https://classifieds-ui-dev.auth.us-east-1.amazoncognito.com/oauth2/userInfo",
      end_session_endpoint: "https://classifieds-ui-dev.auth.us-east-1.amazoncognito.com/logout",
      token_endpoint: "https://classifieds-ui-dev.auth.us-east-1.amazoncognito.com/oauth2/token",
      jwks_uri: "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_z8PhK3D8V"
    },
    signingKeys: signingKeys.keys
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
