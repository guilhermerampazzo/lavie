export interface CredentialFieldStatus {
  key: string;
  label: string;
  secret: boolean;
  hasValue: boolean;
}

export interface ChannelCredentialsStatus {
  label: string;
  hasCredentials: boolean;
  configured: boolean;
  fields: CredentialFieldStatus[];
}

export type ChannelCredentialsStatusMap = Record<string, ChannelCredentialsStatus>;
