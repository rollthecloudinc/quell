//import { EntityMetadataMap } from '@ngrx/data';
import { CrudEntityMetadataMap } from 'crud';

export const entityMetadata: CrudEntityMetadataMap = {
  PanelPageListItem: {
    entityName: 'PanelPageListItem',
    crud: {
      idb_keyval: {
        params: {
          prefix: 'panelpage__'
        }
      }
    }
  },
  PanelPage: {
    entityName: 'PanelPage',
    crud: {
      /*aws_s3_entity: {
        params: {
          bucket: 'classifieds-ui-dev',
          prefix: 'panelpages/',
          serialize: ''
        }
      }*/
      idb_keyval: {
        params: {
          prefix: 'panelpage__'
        }
      }
    }
  },
  PanelPageState: {
    entityName: 'PanelPageState'
  }
};
