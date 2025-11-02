import dotenv from "dotenv";

type serverconfig = {
  PORT: number;
  REDIS_SERVER_URL: string;
  LOCK_TTL: number;
  HOTEL_SERVICE_API:string;
};

// load the env when server is running on machine
// It reads the .env file (a simple text file with key=value pairs) and loads those values into process.env — which is just a JavaScript object holding environment variables.
//Gets "unloaded" (really just disappears) when the Node.js app stops
function loadEnv() {
  dotenv.config();
}

loadEnv();
const serverConfig: serverconfig = {
  PORT: Number(process.env.PORT) || 3001,
  REDIS_SERVER_URL: process.env.REDIS_SERVER_URL || "redis://localhost:6379",
  LOCK_TTL: Number(process.env.LOCK_TTL) || 1000,
  HOTEL_SERVICE_API:process.env.HOTEL_SERVICE_API || "http://localhost:3001/api/v1/",
};

export default serverConfig;
