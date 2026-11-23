export interface FieldOption { value: string | number; label: string; }
export interface FormField {
  key: string; label: string; type?: string; required?: boolean; options?: FieldOption[];
  min?: number; max?: number; hint?: string; lookup?: string;
}
export interface ResourceConfig {
  endpoint: string; title: string; singular: string; icon: string; description: string;
  columns: {key: string; label: string; type?: string}[]; fields: FormField[];
  writeRoles: string[]; multipart?: boolean;
}
export type RecordData = Record<string, any>;
