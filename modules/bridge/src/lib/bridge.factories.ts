import { BridgeBuilderService } from "./services/bridge-builder.service";
import { PublicApiBridgeService } from './services/public-api-bridge.service';
import { BridgeBuilderPlugin } from './models/bridge-builder.models';

export const bridgeAppInit = (builder: BridgeBuilderService) => {
    return () => new Promise<void>(res => { builder.build(); res(); });
};

export const testBridgeFactory = () => {
    return new BridgeBuilderPlugin<string>({
        id: 'test',
        title: 'Test',
        build: () => {
            PublicApiBridgeService.prototype['sayHello2'] = () => {
                alert('say hello 2');
            };
        }
    });
};

