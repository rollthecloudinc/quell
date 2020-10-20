export class MediaSettings {
  endpointUrl: string;
  cloudinaryUrl: string;
  uploadPreset: string;
  imageUrl: string;
  constructor(data?: MediaSettings) {
    if(data) {
      this.endpointUrl = data.endpointUrl;
      this.cloudinaryUrl = data.cloudinaryUrl;
      this.uploadPreset = data.uploadPreset;
      this.imageUrl = data.imageUrl;
    }
  }
}

export class MediaFile {
  id: string;
  contentType: string;
  contentDisposition: string;
  path: string;
  length: number;
  fileName: string;
  constructor(data?: MediaFile) {
    if (data) {
      this.id = data.id;
      this.contentType = data.contentType;
      this.contentDisposition = data.contentDisposition;
      this.path = data.path;
      this.fileName = data.fileName;
      this.length = data.length;
    }
  }
}

export class CloudinaryUploadResponse {
  public_id: string;
  format: string;
  original_filename: string;
  bytes: number;
  constructor(data?: CloudinaryUploadResponse) {
    if (data) {
      this.public_id = data.public_id;
      this.format = data.format;
      this.original_filename = data.original_filename;
      this.bytes = data.bytes;
    }
  }
}
