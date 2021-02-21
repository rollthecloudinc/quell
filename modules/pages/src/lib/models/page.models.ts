interface DatasourceModel<T> {
  new (): T;
}

export class PanelPageStateSlice {
  id: string;
  path: string;
  realPath: string;
  args: Map<string, string>;
  constructor(data?: PanelPageStateSlice) {
    if(data) {
      this.id = data.id;
      this.path = data.path;
      this.realPath = data.realPath;
      this.args = data.args;
    }
  }
}
