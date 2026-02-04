import { Injectable } from "@angular/core";
import { UIRole } from "../models/role.models";

@Injectable({ providedIn: 'root' })
export class RoleRegistry {

  private registry = new Map<string, Set<UIRole>>();

  register<T extends UIRole>(role: string, instance: T, scope?: string) {
    if (!this.registry.has(role)) {
      this.registry.set(role, new Set());
    }
    this.registry.get(role)!.add(instance);
  }

  unregister<T extends UIRole>(role: string, instance: T) {
    this.registry.get(role)?.delete(instance);
  }

  get<T extends UIRole>(role: string, scope?: string): Set<T> {
    const entries = Array.from(this.registry.get(role) ?? []);
    const filtered = entries.filter(e =>
      !scope || (e as any).scope === scope
    );
    return new Set(filtered as T[]);
  }
}