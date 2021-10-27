//import { EntityMetadataMap } from '@ngrx/data';
import { CrudEntityMetadataMap } from 'crud';

export const entityMetadata: CrudEntityMetadataMap = {
  PanelPageListItem: {
    entityName: 'PanelPageListItem'
  },
  PanelPage: {
    entityName: 'PanelPage',
    crud: {
      aws_s3_entity: {
        params: {
          bucket: 'classifieds-ui-dev',
          prefix: 'panelpages/'
        }
      }
    }
  },
  PanelPageState: {
    entityName: 'PanelPageState'
  }
};
