export interface ISelectOption {
  value: string;
  label: string;
}

export const DIRECTION_OPTIONS: ISelectOption[] = [
  { value: "entrant", label: "Entrant" },
  { value: "sortant", label: "Sortant" },
  { value: "interne", label: "Interne" },
];

export const PRIORITY_OPTIONS: ISelectOption[] = [
  { value: "low", label: "Basse" },
  { value: "normal", label: "Normale" },
  { value: "high", label: "Haute" },
  { value: "urgent", label: "Urgente" },
];
