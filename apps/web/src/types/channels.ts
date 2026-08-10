export interface ChannelCredentialField {
  key: string;
  label: string;
  secret: boolean;
  hasValue: boolean;
}

export interface ChannelStatusEntry {
  key: string;
  label: string;
  configured: boolean;
  credentialFields?: ChannelCredentialField[] | null;
}
