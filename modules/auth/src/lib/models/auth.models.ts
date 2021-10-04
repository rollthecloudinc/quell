export class UserInfo {
  sub: string;
  constructor(data?: UserInfo) {
    if(data) {
      this.sub = data.sub;
    }
  }
}

export class PublicUserProfile {
  id: string;
  userName: string;
  constructor(data?: PublicUserProfile) {
    if(data) {
      this.id = data.id;
      this.userName = data.userName;
    }
  }
}