declare module 'compression' {
  import { RequestHandler } from 'express';
  
  interface CompressionOptions {
    filter?: (req: any, res: any) => boolean;
    threshold?: number | string;
    level?: number;
    memLevel?: number;
    strategy?: number;
    chunkSize?: number;
    windowBits?: number;
    zlibOptions?: {
      level?: number;
      memLevel?: number;
      strategy?: number;
      windowBits?: number;
    };
  }
  
  function compression(options?: CompressionOptions): RequestHandler;
  export = compression;
}
