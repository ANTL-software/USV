import { useState, type FormEvent } from 'react';
import type { LeadClient } from '../utils/types/index.ts';

export function useLeadContactEditor(lead: LeadClient, update: (nom: string, prenom: string) => Promise<boolean>) {
  const [editing, setEditing] = useState(false);
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const start = (): void => {
    const prospect = lead.prospect;
    const isCompany = prospect?.nom?.trim().toLocaleUpperCase('fr-FR') === prospect?.raison_sociale?.trim().toLocaleUpperCase('fr-FR');
    const snapshot = lead.interlocuteur_nom?.trim() ?? '';
    setNom(isCompany ? (/^\S+$/.test(snapshot) ? snapshot : '') : prospect?.nom ?? '');
    setPrenom(prospect?.prenom ?? '');
    setEditing(true);
  };
  const submit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (await update(nom.trim(), prenom.trim())) setEditing(false);
  };
  return { editing, nom, prenom, setNom, setPrenom, start, cancel: (): void => setEditing(false), submit };
}
