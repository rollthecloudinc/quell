import { Injectable } from "@angular/core";
import { RoleRegistryEvent, UIRole } from "../models/role.models";
import { BehaviorSubject, Observable } from "rxjs";

@Injectable({ providedIn: 'root' })
export class RoleRegistry {

  private registry = new Map<string, Set<UIRole>>();

  private eventsSubject = new BehaviorSubject<RoleRegistryEvent | null>(null);

  /**
   * Stream of role registry events.
   * Emitted:
   *  - On register
   *  - On unregister
   */
  readonly events$: Observable<RoleRegistryEvent> =
    this.eventsSubject.asObservable().pipe(
      // filter out initial null
      (src) => new Observable(sub => {
        src.subscribe(ev => {
          if (ev) sub.next(ev);
        });
      })
    );

  register<T extends UIRole>(role: string, instance: T, scope?: string) {
    if (!this.registry.has(role)) {
      this.registry.set(role, new Set());
    }
    (instance as any).scope = scope;
    this.registry.get(role)!.add(instance);
    this.eventsSubject.next({
      type: 'register',
      role,
      instance,
      scope
    });
  }

  unregister<T extends UIRole>(role: string, instance: T) {
    this.registry.get(role)?.delete(instance);
    this.eventsSubject.next({
      type: 'unregister',
      role,
      instance,
      scope: (instance as any).scope
    });
  }

  get<T extends UIRole>(role: string, scope?: string): Set<T> {
    const entries = Array.from(this.registry.get(role) ?? []);
    const filtered = entries.filter(e =>
      !scope || (e as any).scope === scope
    );
    return new Set(filtered as T[]);
  }
}