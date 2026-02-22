export interface HostApp {
  name: string;
  version: string;
}

export interface ExtensionInfo {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  host_list: HostApp[];
  cep_version: string;
  install_path: string | null;
  icon_path: string | null;
}

export interface InstallResult {
  success: boolean;
  message: string;
  extension: ExtensionInfo | null;
}

export interface ToastState {
  type: "success" | "error";
  message: string;
}
