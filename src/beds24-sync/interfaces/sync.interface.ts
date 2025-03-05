/**
 * Interfaces for the sync process
 */

export enum SyncOperationType {
  INITIAL = 'initial',
  INCREMENTAL = 'incremental',
}

export enum SyncStatus {
  IN_PROGRESS = 'in_progress',
  SUCCESS = 'success',
  ERROR = 'error',
}

export interface SyncLogEntry {
  id: number;
  operationType: SyncOperationType;
  startTimestamp: Date;
  endTimestamp?: Date;
  status: SyncStatus;
  recordsProcessed?: number;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FullSyncJobData {
  propertyId: number | string;
  fromDate: string;
  toDate: string;
  page: number;
  pageSize: number;
  syncLogId: number;
}

export interface IncrementalSyncJobData {
  propertyId: number | string;
  modifiedFrom: string;
  syncLogId: number;
}

export interface PropertyBookingsOptions {
  fromDate?: string;
  toDate?: string;
  page?: number;
  pageSize?: number;
}
