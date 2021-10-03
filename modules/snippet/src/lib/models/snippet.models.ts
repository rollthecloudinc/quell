export class Snippet {
  content: string;
  contentType: string;
  jsFile?: string;
  jsScript?: string;
  constructor(data?: Snippet) {
    if(data) {
      this.content = data.content;
      this.contentType = data.contentType;
      if (data.jsFile && data.jsFile !== '') {
        this.jsFile = data.jsFile;
      }
      if (data.jsScript && data.jsScript !== '') {
        this.jsScript = data.jsScript;
      }
    }
  }
}