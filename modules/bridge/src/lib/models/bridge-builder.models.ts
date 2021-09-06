import { Plugin } from 'plugin';

export class BridgeBuilderPlugin<T = string> extends Plugin<T>  {
  build: () => void;
  constructor(data?: BridgeBuilderPlugin<T>) {
    super(data);
    if (data) {
      this.build = data.build;
    }
  }
}
