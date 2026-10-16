export interface AppConfig {
  parameters: {
    name: string;
    type: "object";
    default: {
      appName: string;
      functionType: string;
      hostConfigFile: string;
      resourceGroupName: string;
      queues: string[];
    }[];
  }[];
}
