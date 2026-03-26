export type CategoryKey = 'artists' | 'objects' | 'exhibitions' | 'packages';

export interface ApiResponse<T> {
  ok: boolean;
  status: number;
  statusText: string;
  duration: number;
  data?: T;
  error?: string;
  url: string;
  attempts?: number;
}

export interface MoMAObject {
  objectNumber?: string;
  objectID?: number;
  title?: string;
  displayName?: string;
  artistID?: number;
  dated?: string;
  dateBegin?: number;
  dateEnd?: number;
  medium?: string;
  dimensions?: string;
  department?: string;
  classification?: string;
  onView?: number;
  creditLine?: string;
  thumbnail?: string;
  fullImage?: string;
  currentLocation?: string;
  lastModifiedDate?: string;
  [key: string]: unknown;
}

export interface ObjectsResponse {
  source?: string;
  language?: string;
  resultsCount?: number;
  objects?: MoMAObject[];
  [key: string]: unknown;
}

export interface Parameter {
  name: string;
  type: 'string' | 'integer' | 'boolean';
  required: boolean;
  description: string;
  example?: string | number | boolean;
  location: 'query' | 'path';
}

export interface Endpoint {
  id: string;
  method: 'GET';
  category: CategoryKey;
  title: string;
  description: string;
  pathTemplate: string;
  docsPath: string[];
  parameters: Parameter[];
  exampleRequest: string;
  exampleResponse: unknown;
}

export interface RequestHistory {
  id: string;
  timestamp: number;
  endpointId: string;
  endpointTitle: string;
  method: string;
  status: number;
  duration: number;
  safeUrl: string;
}

export interface HistoryReplayPayload {
  endpointId: string;
  safeUrl: string;
}
