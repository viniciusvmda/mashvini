type EnvConfig = {
  apiUrl: string;
};

const env: EnvConfig = {
  apiUrl: import.meta.env.VITE_API_URL,
};

function isPaymentSimulatorEnabled(): boolean {
  return import.meta.env.VITE_PAYMENT_SIMULATOR === "true";
}

export type { EnvConfig };
export { env, isPaymentSimulatorEnabled };
