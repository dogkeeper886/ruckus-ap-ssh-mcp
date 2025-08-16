export interface SSHConfig {
  host: string;
  username: string;
  password: string;
}

export interface ACXStatus {
  serviceEnabled: boolean;
  managedByACX: boolean;
  state: string;
  connectionStatus: string;
  serverList: string;
  configUpdateState: string;
  heartbeatInterval: number;
  certValidation: string;
}

export interface SerialInfo {
  serial: string;
  model: string;
}

export interface ExternalAntennaInfo {
  wifi0: {
    mode: string;
    gain: string;
  };
  wifi1: {
    mode: string;
    gain: string;
  };
}