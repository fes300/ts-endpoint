import { getUser } from "shared";
import { GetFetchHTTPClient } from "ts-endpoint-browser/lib/fetch";

export const apiClient = GetFetchHTTPClient(
  {
    // proxy request through corsproxy server
    host: "localhost:1337/localhost",
    protocol: "http",
    port: 3000,
  },
  { getUser }
);
