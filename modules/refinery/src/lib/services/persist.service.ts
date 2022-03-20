import { Injectable } from "@angular/core";
import { map, Observable, switchMap } from "rxjs";
import { DuctdataInput, PersistenceFormPayload } from "../models/refinery.models";
import { DataductPluginManager } from "./dataduct-plugin-manager.service";

@Injectable({
  providedIn : 'root'
})
export class PersistService {
  constructor(
    private dpm: DataductPluginManager
  ) {
  }
  persist({ data, persistence }: { data: any, persistence: PersistenceFormPayload }): Observable<void> {
    return this.dpm.getPlugin(persistence.dataduct.plugin).pipe(
      switchMap(p => p.send(new DuctdataInput({ data, settings: persistence.dataduct.settings }))),
      map(() => undefined)
    );
  }
}