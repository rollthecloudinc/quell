// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.
// import { GlobalErrorHandler } from '@classifieds-ui/logging';


export const environment = {
  production: false,
  apiGatewaySettings: {
    // endpointUrl: 'https://localhost:44340',
    endpointUrl: "https://80ry0dd5s4.execute-api.us-east-1.amazonaws.com"
  },
  mediaSettings: {
    endpointUrl: 'https://80ry0dd5s4.execute-api.us-east-1.amazonaws.com/media',
    cloudinaryUrl: 'https://api.cloudinary.com/v1_1/dj4vvkgzw',
    uploadPreset: 'i0hm4opm',
    imageUrl: 'https://80ry0dd5s4.execute-api.us-east-1.amazonaws.com'
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
