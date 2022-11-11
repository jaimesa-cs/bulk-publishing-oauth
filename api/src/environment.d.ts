declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT: string;
      CS_CM_TOKEN: string;
      CS_API_KEY: string;
      CS_API_HOST: string;
    }
  }
}
export {};
