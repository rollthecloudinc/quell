import { EntityMetadata } from "@ngrx/data";
import { CrudOperations } from "../models/crud.models";
import * as jre from "json-rules-engine";

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
  plugin?: string;
  params?: CrudEntityConfigurationParams;
  plugins?: CrudEntityConfiguration;
  rule?: jre.Rule
  ops?: Array<CrudOperations>
  queryMappings?: Map<string, CrudEntityQueryMapping>
  fallback?: boolean;
}

export interface CrudEntityConfigurationParams {
  [name: string]: any;
}

export interface CrudEntityQueryMapping {
  defaultOperator?: string;
}