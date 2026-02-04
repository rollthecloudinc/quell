import { Injectable, Injector } from '@angular/core';
// import { InteractionHandlerPlugin } from '@rollthecloudinc/detour';
import { Observable } from 'rxjs';
import { RoleRegistry } from '../services/role-registry.service';

export type RoleName = string;

export interface RoleInstance {
  // marker interface – real roles extend this
}

export type RoleRegistryMap = Map<RoleName, Set<RoleInstance>>;


export interface UIRole {
  // readonly role: string;
}

export interface RoleRegistration {
    role: string;
  instance: UIRole;
  scope?: string; 
}

/*export function RegisterRole<R extends UIRole>(role: string, scope?: string) {
  return function (target: any) {

    const def = target.ɵcmp || target.ɵdir;

    if (!def) {
      console.error(`RegisterRole: no Angular definition found for`, target);
      return;
    } else {
        console.log(`RegisterRole: registering role '${role}' for`, target);
    }

    const originalInit = def.onInit;
    const originalDestroy = def.onDestroy;

    console.log('register role def', def);

    def.onInit = function() {
      const registry = this.injector.get(RoleRegistry);
      registry.register(role, this, scope);
      console.log(`Registered role '${role}' for`, this);
      originalInit?.call(this);
    };

    def.onDestroy = function() {
      const registry = this.injector.get(RoleRegistry);
      console.log(`Unregistering role '${role}' for`, this);
      registry.unregister(role, this);
      originalDestroy?.call(this);
    };
  };
}*/

export function RegisterRole<R extends UIRole>(role: string, scope?: string) {
  return function (target: any) {

    console.log(`RegisterRole applied to`, target);

    const originalNgOnInit = target.prototype.ngOnInit;
    const originalNgOnDestroy = target.prototype.ngOnDestroy;

    target.prototype.ngOnInit = function () {
      console.log(`[RegisterRole] ngOnInit for role '${role}'`);

      if (!this.injector) {
        throw new Error(
          `Component using @RegisterRole('${role}') must inject Injector`
        );
      }

      const registry = this.injector.get(RoleRegistry);
      registry.register(role, this, scope);

      if (originalNgOnInit) {
        originalNgOnInit.apply(this);
      }
    };

    target.prototype.ngOnDestroy = function () {
      console.log(`[RegisterRole] ngOnDestroy for role '${role}'`);

      const registry = this.injector.get(RoleRegistry);
      registry.unregister(role, this);

      if (originalNgOnDestroy) {
        originalNgOnDestroy.apply(this);
      }
    };
  };
}

export function RoleMixin<R extends UIRole>(role: string, scope?: string) {
  return class {
    constructor(public injector: Injector) {}

    ngOnInit() {
      const registry = this.injector.get(RoleRegistry);
      registry.register(role, this as any, scope);
    }

    ngOnDestroy() {
      const registry = this.injector.get(RoleRegistry);
      registry.unregister(role, this as any);
    }
  };
}

export interface RoleHandlerContext<R extends UIRole> {
  roleInstances: Set<R>;
  params: any;
  event: Event;
}

export type AsyncOrSync<T> = T | Promise<T> | Observable<T>;

export function createRoleHandler<R extends UIRole>(
  role: string,
  handler: (ctx: RoleHandlerContext<R>) => AsyncOrSync<void>
) {
  return async (injector: Injector, params: any, evt: Event) => {
    const registry = injector.get(RoleRegistry);
    const instances = registry.get<R>(role);

    const result = handler({
      roleInstances: instances,
      params,
      event: evt
    });

    if (result instanceof Observable) {
      await result.toPromise();
    } else {
      await result;
    }
  };
}