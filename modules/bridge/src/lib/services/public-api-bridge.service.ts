import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
})
export class PublicApiBridgeService {
    sayHello() {
        alert('Hello');
    }
}