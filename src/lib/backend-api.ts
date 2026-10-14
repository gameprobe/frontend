import { createBackendClient } from "./backend-client";

export const backendApi = createBackendClient(import.meta.env.VITE_BACKEND_URL);
