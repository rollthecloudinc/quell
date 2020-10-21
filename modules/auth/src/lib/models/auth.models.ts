export class ClientSettings {
  authority: string;
  client_id: string;
  redirect_uri: string;
  silent_redirect_uri: string;
  response_type: string;
  scope: string;
  filterProtocolClaims: boolean;
  loadUserInfo: boolean;
  automaticSilentRenew: boolean;
  metadata: any;
  userStore: any;
  stateStore: any;
  constructor(data?: ClientSettings) {
    if(data) {
      this.authority = data.authority;
      this.client_id = data.client_id;
      this.redirect_uri = data.redirect_uri;
      this.silent_redirect_uri = data.silent_redirect_uri;
      this.response_type = data.response_type;
      this.scope = data.scope;
      this.filterProtocolClaims = data.filterProtocolClaims;
      this.loadUserInfo = data.loadUserInfo;
      this.automaticSilentRenew = data.automaticSilentRenew;
      this.metadata = { ...data.metadata };
      this.userStore = data.userStore ? data.userStore : undefined;
      this.stateStore = data.userStore ? data.stateStore : undefined;
    }
  }
}

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
