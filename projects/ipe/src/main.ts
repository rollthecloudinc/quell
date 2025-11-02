import { initFederation } from '@softarc/native-federation';

// Wrap the entire initialization in a timeout to ensure the shim 
// has had time to process the <script type="importmap-shim"> tag.
  initFederation({})
    .catch(err => console.error(err))
    .then(_ => import('./bootstrap'))
    .catch(err => console.error(err));
