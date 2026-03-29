export const env = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL,
  appEnv: process.env.NEXT_PUBLIC_APP_ENV,
} as const;

export function getRuntimeEnv(): NodeJS.ProcessEnv {
  const runtimeEnv = { ...process.env };

  delete runtimeEnv.LD_PRELOAD;
  delete runtimeEnv.DYLD_INSERT_LIBRARIES;
  delete runtimeEnv.DYLD_LIBRARY_PATH;

  return runtimeEnv;
}
