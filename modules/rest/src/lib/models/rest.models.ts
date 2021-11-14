import { Renderer } from "datasource";
import { Param } from "dparam";
import { Snippet } from "snippet";

export class Rest {
  url: string;
  renderer: Renderer;
  params: Array<Param> = [];
  body?: Snippet;
  method?: string;
  constructor(data?: Rest) {
    if(data) {
      this.url = data.url;
      this.method = data.method ? data.method : undefined;
      if(data.renderer !== undefined) {
        this.renderer = new Renderer(data.renderer);
      }
      // For now leave these on rest even though they should probably be one level above inside datasource... maybe not :/
      if(data.params !== undefined) {
        this.params = data.params.map(p => new Param(p));
      }
      if (data.body) {
        this.body = new Snippet(data.body);
      }
    }
  }
}