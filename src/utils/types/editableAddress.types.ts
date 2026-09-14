export interface EditableAddress {
  raison_sociale?: string;
  adresse: string;
  code_postal: string;
  ville: string;
  pays: string;
}

export interface AddressEditorViewModel {
  editing: boolean;
  saving: boolean;
  error: string;
  draft: EditableAddress;
  start: () => void;
  cancel: () => void;
  change: (field: keyof EditableAddress, value: string) => void;
  select: (value: import('./address.types.ts').AddressSelectionResult) => void;
  save: () => Promise<void>;
}
