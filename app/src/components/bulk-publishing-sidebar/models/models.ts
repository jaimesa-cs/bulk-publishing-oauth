import { KeyValueObj } from "../../../types";

export const ASSET_REGEXP: RegExp =
  /"url":[\s:]+"https:\/\/images.contentstack.io\/v3\/assets\/[a-z0-9]+\/([a-z0-9]+)\//gm;
export const REF_REGEXP: RegExp = /"uid":[\s]+"(.*)",[\s]+"_content_type_uid":[\s]+"(.*)"/gm;

export interface IBulkPublishingConfig extends KeyValueObj {}

export interface IProgress {
  percentage: number;
  current: number;
  total: number;
  label?: string;
}
export interface ICheckable {
  name: string;
  checked: boolean;
}

export interface IDataStatus {
  allEntries: IDictionary<IReference>;
  data: any[];
  statuses: any;
  initiallySelected: any;
  selectedReferences: any;
}

export interface IEnvironmentConfig extends ICheckable {
  uid: string;
}
export interface ILocaleConfig extends ICheckable {
  code: string;
  isMaster: boolean;
}

export interface ILog {
  message: string;
  type: "error" | "info" | "warning";
}
export interface IPublishData {
  key: string;
  uid: string;
  isAsset: boolean;
}
export interface AppContext {}

export interface IBaseItem {
  id: string;
}

export interface IProcessedItem extends IBaseItem {
  completed: boolean;
}
export interface IReference {
  uniqueKey: string;
  uid: string;
  isAsset: boolean;
  content_type_uid?: string;
  entry: any;
  references?: string[];
  locales?: any;
  locale: string;
  parent?: string;
  depth?: number;
}

export interface IStatus {
  success: boolean;
  payload: any;
}
export interface IPublishStatus {
  uid: string;
  content_type_uid?: string;
  status: IStatus;
}

export interface ReferenceTree {
  [key: string]: IReference;
}

export interface IDictionary<T> {
  [key: string]: T;
}

export enum OPERATIONS {
  NONE = 0,
  PUBLISHING = 1,
  CREATE_RELEASE = 2,
  CREATING_RELEASE = 3,
  ADD_TO_RELEASE = 4,
  ADDING_TO_RELEASE = 5,
  LOADING_REFERENCES = 100,
}
