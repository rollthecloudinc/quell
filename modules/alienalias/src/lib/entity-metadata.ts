//import { EntityMetadataMap } from '@ngrx/data';
import { isPlatformServer } from '@angular/common';
import { CrudEntityMetadataMap, CrudEntityQueryMapping } from 'crud';
import { AlienaliasSettings } from './models/alienalias.models';

export const entityMetadataFactory = (platformId: Object, alienaliasSettings: AlienaliasSettings): CrudEntityMetadataMap => {
  return {
    AlienAlias: {
      entityName: 'AlienAlias',
      crud: {
        //...(isPlatformServer(platformId) ?
        // {} :
        //{ 
          aws_opensearch_template: {
            ops: ['query'],
            params: {
              id: 'panelpagelistitems', // in a way this could just be a generic routes template - index can change.
              index: 'classified_alienalias',
              hits: true,
              source: true,
              domain: alienaliasSettings.openSearchDomain,
              region: 'us-east-1'
            }
          },
        //}),
        ...(isPlatformServer(platformId) ?
          {} :
          {
            idb_keyval: {
              params: {
                prefix: 'alienalias__'
              },
              queryMappings: new Map<string, CrudEntityQueryMapping>([
                // ['path', { defaultOperator: 'startsWith' }]
                ['site', { defaultOperator: 'term||wildcard' }],
                ['path', { defaultOperator: 'term||wildcard' }]
              ])
            }
          }
        )
      }
    }
  }
};
