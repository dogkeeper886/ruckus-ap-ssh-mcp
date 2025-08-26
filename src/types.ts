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

export interface ClientAdmissionControlInfo {
  wifi0: {
    enabled: boolean;
    radioLoadThreshold: number;
    clientCountThreshold: number;
    clientThroughputThreshold: number;
  };
  wifi1: {
    enabled: boolean;
    radioLoadThreshold: number;
    clientCountThreshold: number;
    clientThroughputThreshold: number;
  };
}

export interface WiFiChannelInfo {
  wifi0: {
    radioEnabled: boolean;
    channel: number | null;
    status: string;
    band?: string; // 2.4GHz
  };
  wifi1: {
    radioEnabled: boolean;
    channel: number | null;
    status: string;
    band?: string; // 5GHz
  };
  wifi2?: {
    radioEnabled: boolean;
    channel: number | null;
    status: string;
    band?: string; // 6GHz or second 5GHz
  };
}