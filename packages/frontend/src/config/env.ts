type EnvConfig = {
  apiUrl: string;
};

const env: EnvConfig = {
  apiUrl: import.meta.env.VITE_API_URL,
};

export type { EnvConfig };
export { env };
