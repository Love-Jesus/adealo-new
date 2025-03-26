// Type declarations for modules without built-in types

declare module 'firebase-functions' {
  namespace storage {
    interface ObjectMetadata {
      name?: string;
      bucket?: string;
      [key: string]: any;
    }
    
    function object(): {
      onFinalize(handler: (object: ObjectMetadata) => Promise<any>): any;
    };
  }
  
  namespace https {
    class HttpsError extends Error {
      constructor(code: string, message: string, details?: any);
    }
    
    interface CallableContext {
      auth?: {
        uid: string;
        token: any;
      };
      [key: string]: any;
    }
    
    function onCall(handler: (data: any, context: CallableContext) => any): any;
  }
  
  export { storage, https };
}

declare module 'firebase-admin' {
  namespace firestore {
    const FieldValue: {
      serverTimestamp(): any;
      arrayUnion(...elements: any[]): any;
    };
    
    interface DocumentSnapshot {
      exists: boolean;
      id: string;
      data(): any;
    }
    
    interface QuerySnapshot {
      empty: boolean;
      size: number;
      docs: DocumentSnapshot[];
    }
    
    interface DocumentReference {
      id: string;
      set(data: any): Promise<any>;
      update(data: any): Promise<any>;
      get(): Promise<DocumentSnapshot>;
    }
    
    interface Query {
      where(field: string, opStr: string, value: any): Query;
      orderBy(field: string, direction?: 'asc' | 'desc'): Query;
      limit(limit: number): Query;
      startAfter(snapshot: DocumentSnapshot): Query;
      get(): Promise<QuerySnapshot>;
      doc(id?: string): DocumentReference;
      add(data: any): Promise<DocumentReference>;
    }
    
    interface CollectionReference extends Query {
      doc(id?: string): DocumentReference;
      add(data: any): Promise<DocumentReference>;
    }
    
    interface Firestore {
      collection(path: string): CollectionReference;
    }
  }
  
  namespace storage {
    interface File {
      getSignedUrl(options: { action: string; expires: number }): Promise<[string]>;
      download(options: { destination: string }): Promise<any>;
    }
    
    interface Bucket {
      file(path: string): File;
      upload(path: string, options?: any): Promise<any>;
    }
    
    interface Storage {
      bucket(name?: string): Bucket;
    }
  }
  
  function initializeApp(): any;
  function firestore(): firestore.Firestore;
  function storage(): storage.Storage;
  
  export { initializeApp, firestore, storage };
}

declare module 'csv-parser' {
  interface CsvParserOptions {
    separator?: string;
    skipLines?: number;
    headers?: boolean | string[];
    mapValues?: (value: any) => any;
    mapHeaders?: (header: string) => string;
  }
  
  function csvParser(options?: CsvParserOptions): any;
  export default csvParser;
}

declare module 'json2csv' {
  export class Parser {
    constructor(options?: {
      fields?: string[];
      delimiter?: string;
      eol?: string;
      quote?: string;
      transforms?: any[];
      header?: boolean;
    });
    
    parse(data: any): string;
  }
  
  export function parse(data: any, options?: {
    fields?: string[];
    delimiter?: string;
    eol?: string;
    quote?: string;
    transforms?: any[];
    header?: boolean;
  }): string;
}
