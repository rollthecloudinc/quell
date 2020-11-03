export class Snippet {
  content: string;
  contentType: string;
  constructor(data?: Snippet) {
    if(data) {
      this.content = data.content;
      this.contentType = data.contentType;
    }
  }
}
