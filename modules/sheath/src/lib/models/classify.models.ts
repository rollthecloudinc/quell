export enum ClassClassification {
  KEEP,
  ADD,
  REMOVE
}

export type ClassMap = Map<string, Map<string, ClassClassification>>;