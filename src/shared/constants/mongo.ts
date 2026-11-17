export const MONGO_MAX_RETRIES = 2;
export const MONGO_RETRY_DELAY_MS = 1000;
// The driver's default (30s) multiplied by retries would hang a request for minutes when Mongo is down.
export const MONGO_SERVER_SELECTION_TIMEOUT_MS = 5000;
