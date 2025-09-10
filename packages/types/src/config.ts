export interface DatabaseConfig {
  uri: string;
  dbName: string;
}

export interface AIConfig {
  geminiApiKey?: string;
  groqApiKey?: string;
}

export interface ServerConfig {
  port: number;
  corsOrigin: string;
  maxFileSize: number;
}

export interface FileStorageConfig {
  provider: 'vercel-blob' | 'mongodb-gridfs';
  vercelBlobToken?: string;
  mongoGridFSBucket?: string;
}

export interface AppConfig {
  database: DatabaseConfig;
  ai: AIConfig;
  server: ServerConfig;
  fileStorage: FileStorageConfig;
}
