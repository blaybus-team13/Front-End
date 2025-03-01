const mongoUser = process.env.MONGODB_USER || "";
const mongoPassword = process.env.MONGODB_PASSWORD || "";
const mongoPort = process.env.MONGODB_PORT || "";
const mongoHost = process.env.MONGODB_HOST || "";

const uri = `mongodb://${mongoUser}:${mongoPassword}@${mongoHost}:${mongoPort}`;
const dbName = process.env.MONGODB_DB || "";

export { uri, dbName };
