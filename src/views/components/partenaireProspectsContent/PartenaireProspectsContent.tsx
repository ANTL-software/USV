import type { FormEvent, ReactElement } from 'react';
import { MdArrowBack, MdDownload, MdSearch } from 'react-icons/md';
import type { PartenaireProspectsPageViewModel } from '../../../hooks/index.ts';
import type { PartenaireProspectRow } from '../../../utils/types/index.ts';
import { Button } from '../button/index.ts';

interface PartenaireProspectsContentProps {
  viewModel: PartenaireProspectsPageViewModel;
}

const normalizeAddressPart = (value: string): string => value
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/\s+/g, ' ')
  .trim()
  .toLocaleLowerCase('fr-FR');

const displayAddress = (prospect: PartenaireProspectRow): string => {
  const primaryAddress = prospect.adresse_facturation
    || prospect.adresse_livraison
    || prospect.sirene_adresse
    || '';
  const addressParts = [primaryAddress, prospect.code_postal || '', prospect.ville || '', prospect.pays || '']
    .map((part) => part.trim())
    .filter(Boolean);
  const uniqueParts: string[] = [];

  for (const part of addressParts) {
    const normalizedPart = normalizeAddressPart(part);
    const alreadyIncluded = uniqueParts.some((existing) => (
      normalizeAddressPart(existing).includes(normalizedPart)
      || normalizedPart.includes(normalizeAddressPart(existing))
    ));
    if (!alreadyIncluded) uniqueParts.push(part);
  }

  return uniqueParts.join(', ') || '—';
};

const displayContact = (prospect: PartenaireProspectRow): string => {
  const contactName = prospect.decisionnaire_nom
    || prospect.nom_contact
    || [prospect.prenom, prospect.nom].filter(Boolean).join(' ');

  return [prospect.civilite, contactName].filter(Boolean).join(' ') || '—';
};

export function PartenaireProspectsContent({ viewModel }: PartenaireProspectsContentProps): ReactElement {
  const submitSearch = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    viewModel.submitSearch();
  };

  return (
    <main>
      <div className="partnerProspects__container">
        <Button style="back" onClick={viewModel.navigateBack}><MdArrowBack /> Retour</Button>
        <header className="partnerProspects__header">
          <div>
            <h1>Extraction des prospects</h1>
            <p>Prospects injectés dans votre campagne partenaire.</p>
          </div>
          <span className="partnerProspects__count">
            {viewModel.selectedCampaign?.nom_campagne || 'Campagne partenaire'}
          </span>
        </header>

        <section className="partnerProspects__controls" aria-label="Filtres et export">
          <form onSubmit={submitSearch}>
            <label htmlFor="partner-prospect-search">Rechercher</label>
            <div className="partnerProspects__search">
              <input
                id="partner-prospect-search"
                type="search"
                value={viewModel.search}
                onChange={(event) => viewModel.setSearch(event.target.value)}
                placeholder="Société, contact, téléphone, email, SIRET…"
              />
              <Button type="submit" style="green"><MdSearch /> Rechercher</Button>
              <Button type="button" style="grey" onClick={viewModel.resetSearch}>Réinitialiser</Button>
            </div>
          </form>
          <a className="partnerProspects__export" href={viewModel.exportUrl} download>
            <MdDownload /> Télécharger la base (.csv)
          </a>
        </section>

        {viewModel.error && <p className="partnerProspects__error">{viewModel.error}</p>}
        {viewModel.isLoading ? (
          <div className="partnerProspects__state">Chargement des prospects…</div>
        ) : viewModel.prospects.length === 0 ? (
          <div className="partnerProspects__state">Aucun prospect injecté ne correspond à ces critères.</div>
        ) : (
          <div className="partnerProspects__table-wrap">
            <table className="partnerProspects__table">
              <thead>
                <tr>
                  <th>ID</th><th>Raison sociale</th><th>Contact</th><th>Téléphone</th><th>Téléphone contact</th>
                  <th>Adresse</th><th>Activité</th><th>État campagne</th><th>Appels</th>
                </tr>
              </thead>
              <tbody>
                {viewModel.prospects.map((prospect) => (
                  <tr key={prospect.campagne_id_prospection}>
                    <td><code>#{prospect.id_prospect}</code></td>
                    <td><strong>{prospect.raison_sociale || '—'}</strong></td>
                    <td>{displayContact(prospect)}<small>{prospect.decisionnaire_fonction || ''}</small></td>
                    <td><strong>{prospect.telephone || '—'}</strong></td>
                    <td>{prospect.telephone_contact || '—'}</td>
                    <td>{displayAddress(prospect)}</td>
                    <td>{prospect.activite || '—'}</td>
                    <td><span className="partnerProspects__badge">{prospect.campagne_statut_file || '—'}</span></td>
                    <td><strong>{prospect.campagne_total_appels || 0}</strong><small>{prospect.campagne_dernier_statut_appel || 'Aucun appel'}</small></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {viewModel.pagination && (viewModel.page > 1 || viewModel.pagination.has_more) && (
              <nav className="partnerProspects__pagination" aria-label="Pagination des prospects">
                <Button style="white" disabled={viewModel.page === 1} onClick={viewModel.previousPage}>Précédent</Button>
                <span>Page <strong>{viewModel.page}</strong></span>
                <Button style="white" disabled={!viewModel.pagination.has_more} onClick={viewModel.nextPage}>Suivant</Button>
              </nav>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
