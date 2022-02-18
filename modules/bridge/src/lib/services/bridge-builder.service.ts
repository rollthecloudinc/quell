import { Injectable } from "@angular/core";
import { BridgeBuilderPluginManager } from "./bridge-builder-plugin-manager.service";

@Injectable({
    providedIn: 'root'
})
export class BridgeBuilderService {
    constructor (
        private bpm: BridgeBuilderPluginManager
    ) {}
    build() {
        try {
            console.log('build bridge...');
            this.bpm.getPlugins().subscribe(plugins => {
                Array.from(plugins).forEach(([k, p]) => {
                    p.build();
                    console.log('bridge build: ' + k);
                });
            });
            console.log('bridge built.');
        } catch (e) {

        }
    }
}