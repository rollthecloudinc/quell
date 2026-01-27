import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, BaseRouteReuseStrategy } from "@angular/router";

@Injectable()
export class YieldingRouteReuseStrategy extends BaseRouteReuseStrategy {
    shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
        return true;
    }
}