import { useId, type ReactElement } from 'react';
import { IoCheckmark, IoClose, IoLocation, IoPencil } from 'react-icons/io5';
import type { AddressEditorViewModel } from '../../../utils/types/index.ts';
import { AddressAutocomplete } from '../addressAutocomplete/index.ts';
import './addressEditor.scss';

interface AddressEditorProps { title: string; lines: string[]; viewModel: AddressEditorViewModel; companyName?: string | null; companyNameLabel?: string; notice?: string }
export function AddressEditor({ title, lines, viewModel: vm, companyName, companyNameLabel, notice }: AddressEditorProps): ReactElement {
  const id = useId();
  return <section className="address-editor" aria-label={title}>
    <div className="address-editor__heading"><span><IoLocation /> {title}</span>
      {!vm.editing && <button type="button" className="address-editor__pencil" onClick={vm.start} aria-label={`Modifier ${title}`} title={`Modifier ${title}`}><IoPencil /></button>}
    </div>
    {vm.editing ? <form className="address-editor__form" onSubmit={(event) => { event.preventDefault(); void vm.save(); }}>
      {companyNameLabel && <label htmlFor={`${id}-company`}>{companyNameLabel}<input id={`${id}-company`} maxLength={255} value={vm.draft.raison_sociale || ''} onChange={(event) => vm.change('raison_sociale', event.target.value)} disabled={vm.saving} /></label>}
      <AddressAutocomplete id={`${id}-street`} label="Adresse" value={vm.draft.adresse} onChange={(value) => vm.change('adresse', value)} onSelectAddress={vm.select} disabled={vm.saving} />
      <div className="address-editor__locality">
        <label htmlFor={`${id}-postcode`}>Code postal<input id={`${id}-postcode`} maxLength={10} value={vm.draft.code_postal} onChange={(event) => vm.change('code_postal', event.target.value)} disabled={vm.saving} /></label>
        <label htmlFor={`${id}-city`}>Ville<input id={`${id}-city`} maxLength={100} value={vm.draft.ville} onChange={(event) => vm.change('ville', event.target.value)} disabled={vm.saving} /></label>
      </div>
      <label htmlFor={`${id}-country`}>Pays<input id={`${id}-country`} maxLength={100} value={vm.draft.pays} onChange={(event) => vm.change('pays', event.target.value)} disabled={vm.saving} /></label>
      {notice && <p className="address-editor__notice">{notice}</p>}
      {vm.error && <p className="address-editor__error" role="alert">{vm.error}</p>}
      <div className="address-editor__actions"><button type="button" onClick={vm.cancel} disabled={vm.saving}><IoClose /> Annuler</button><button type="submit" disabled={vm.saving}><IoCheckmark /> {vm.saving ? 'Enregistrement…' : 'Enregistrer'}</button></div>
    </form> : <div className="address-editor__lines">{companyNameLabel && companyName && <p className="address-editor__company-name">{companyName}</p>}{lines.map((line, index) => <p key={`${index}-${line}`}>{line}</p>)}</div>}
  </section>;
}
