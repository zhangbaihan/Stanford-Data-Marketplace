// Types matching the backend Dataset model

export interface Contributor {
  name: string;
  role: string;
}

export interface Provenance {
  creator: string;
  contributors?: Contributor[];
  doi?: string;
}

export interface SupportingFile {
  name: string;
  type: string;
}

export interface Link {
  name: string;
  url: string;
}

export interface Contact {
  name: string;
  email: string;
}

export interface Dataset {
  _id: string;
  id: string; // Virtual from _id
  title: string;
  description: string;
  abstract?: string;
  tags: string[];
  tableCount: number;
  fileCount: number;
  size?: string;
  version?: string;
  provenance?: Provenance;
  methodology?: string;
  usageNotes?: string;
  supportingFiles?: SupportingFile[];
  links?: Link[];
  license?: string;
  contact?: Contact;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  uploadedBy?: {
    _id: string;
    username: string;
  };
  downloadCount: number;
  isPublic: boolean;
  status: 'pending' | 'approved' | 'rejected';
  lastUpdated: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface DatasetsResponse {
  datasets: Dataset[];
  pagination: PaginationInfo;
}

export interface TagsResponse {
  tags: string[];
}

export interface DatasetResponse {
  dataset: Dataset;
}

export interface DownloadResponse {
  downloadUrl: string;
  fileName: string;
  expiresIn: number;
}

export interface User {
  _id: string;
  googleId: string;
  email: string;
  username: string;
  isProfileComplete: boolean;
}

export interface AuthStatusResponse {
  isAuthenticated: boolean;
  user?: User;
}
