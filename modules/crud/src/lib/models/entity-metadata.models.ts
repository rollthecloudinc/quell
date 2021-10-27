import { EntityMetadata } from "@ngrx/data";

export interface CrudEntityMetadata<T = any, S extends object = {}> extends EntityMetadata<T, S>  {
  crud: CrudEntityConfiguration;
}

export interface CrudEntityMetadataMap {
  [entityName: string]: Partial<EntityMetadata<any>> & Partial<CrudEntityMetadata<any>>;
}

export interface CrudEntityConfiguration {
  [plugin: string]: CrudEntityConfigurationPlugin;
}

export interface CrudEntityConfigurationPlugin {
  params: CrudEntityConfigurationParams;
}

export interface CrudEntityConfigurationParams {
  [name: string]: any;
}