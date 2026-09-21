import type { ReactElement } from 'react';
import Select from 'react-select';
import type { ProspectInjectionPageViewModel } from '../../../hooks/index.ts';
import { MdArrowBack } from 'react-icons/md';
import { BackToTop, Button, Header, Modal, SubNav } from '../index.ts';
import { createReactSelectStyles } from '../../../utils/styles/index.ts';
import type { ProspectSelectOption } from '../../../utils/scripts/index.ts';

type ProspectTypeOption = ProspectSelectOption<'Particulier' | 'Entreprise' | ''>;
type ProspectRelationOption = ProspectSelectOption<'prospect' | 'client' | 'lead_genere' | ''>;

const prospectTypeSelectStyles = createReactSelectStyles<ProspectTypeOption, true>(true);
const prospectRelationSelectStyles = createReactSelectStyles<ProspectRelationOption, true>(true);
const prospectMultiSelectStyles = createReactSelectStyles<ProspectSelectOption, true>(true);
const prospectSingleSelectStyles = createReactSelectStyles<ProspectSelectOption, false>();

interface ProspectInjectionContentProps { viewModel: ProspectInjectionPageViewModel; }

export function ProspectInjectionContent({ viewModel }: ProspectInjectionContentProps): ReactElement {
  const {
    campagneId,
    campagneNom,
    closeCountModal,
    closeResultModal,
    count,
    countModalOpen,
    countProspects,
    filters,
    hasInjected,
    injectProspects,
    isLoading,
    result,
    resultModalOpen,
    updateFilter,
    fallbackAreaOptions,
    relationOptions,
    navigateBack,
    nafOptions,
    sourceOptions,
    typeOptions,
  } = viewModel;

  return (
    <div id="prospectInjection">
      <Header />
      <SubNav />
      <main>
        <div className="prospectInjection__container">
          <div className="prospectInjection__header">
            <Button style="back" onClick={navigateBack}>
              <MdArrowBack /> Retour
            </Button>
            <h2>Injecter des prospects dans la campagne #{campagneId ?? '—'}{campagneNom ? ` — ${campagneNom}` : ''}</h2>
          </div>

          <form className="prospectInjection__form" onSubmit={(event) => { event.preventDefault(); countProspects(); }}>
            <fieldset>
              <legend>Filtres de sélection</legend>

              <div className="formGrid">
                <div className="formRow">
                  <div className="formGroup">
                    <label>Code postal de départ</label>
                    <input
                      type="text"
                      placeholder="ex: 13300"
                      value={filters.code_postal || ''}
                      onChange={(e) => updateFilter('code_postal', e.target.value)}
                    />
                    <span className="helperText">
                      Requis (5 chiffres). Point de départ du calcul géographique.
                    </span>
                  </div>
                  <div className="formGroup">
                    <label>Rayon (km)</label>
                    <input
                      type="number"
                      min={1}
                      max={150}
                      value={filters.rayon_km ?? 150}
                      onChange={(event) => updateFilter('rayon_km', event.target.value ? Number.parseInt(event.target.value, 10) : undefined)}
                    />
                    <span className="helperText">Distance maximale autour du code postal.</span>
                  </div>
                </div>

                <div className="formRow">
                  <div className="formGroup">
                    <label>Secteur d'activité</label>
                    <input
                      type="text"
                      placeholder="Recherche secteur..."
                      value={filters.secteur || ''}
                      onChange={(e) => updateFilter('secteur', e.target.value)}
                    />
                  </div>
                </div>

                <div className="formRow">
                  <div className="formGroup">
                    <label>Type de prospect</label>
                    <Select<ProspectTypeOption, true>
                      isMulti
                      closeMenuOnSelect={false}
                      options={typeOptions.filter(option => option.value !== '')}
                      value={typeOptions.filter(option => option.value !== '' && (filters.types_prospect || []).includes(option.value))}
                      onChange={(options) => updateFilter('types_prospect', options.map(option => option.value).filter(value => value !== ''))}
                      styles={prospectTypeSelectStyles}
                      placeholder="Tous"
                      isSearchable={false}
                    />
                  </div>
                  <div className="formGroup">
                    <label>Relation campagne</label>
                    <Select<ProspectRelationOption, true>
                      isMulti
                      closeMenuOnSelect={false}
                      options={relationOptions.filter(option => option.value !== '')}
                      value={relationOptions.filter(option => option.value !== '' && (filters.relations_commerciales || []).includes(option.value))}
                      onChange={(options) => updateFilter('relations_commerciales', options.map(option => option.value).filter(value => value !== ''))}
                      styles={prospectRelationSelectStyles}
                      placeholder="Tous"
                      isSearchable={false}
                    />
                  </div>
                </div>

                <div className="formRow">
                  <div className="formGroup">
                    <label>Source de prospect</label>
                    <Select<ProspectSelectOption, true>
                      isMulti
                      closeMenuOnSelect={false}
                      options={sourceOptions.filter(option => option.value !== '')}
                      value={sourceOptions.filter(option => option.value !== '' && (filters.sources || []).includes(option.value))}
                      onChange={(options) => updateFilter('sources', options.map(option => option.value))}
                      styles={prospectMultiSelectStyles}
                      placeholder="Tous"
                      isSearchable
                    />
                  </div>
                  <div className="formGroup">
                    <label>Codes NAF</label>
                    <Select<ProspectSelectOption, true>
                      isMulti
                      closeMenuOnSelect={false}
                      options={nafOptions}
                      value={nafOptions.filter(option => (filters.codes_naf || []).includes(option.value))}
                      onChange={(options) => updateFilter('codes_naf', options.map(option => option.value))}
                      styles={prospectMultiSelectStyles}
                      placeholder="Sélectionner un ou plusieurs codes NAF"
                      isSearchable
                    />
                  </div>
                </div>

                <div className="formRow">
                  <div className="formGroup">
                    <label>Effectif minimum</label>
                    <input
                      type="number"
                      min={0}
                      value={filters.effectif_min ?? ''}
                      onChange={(event) => updateFilter('effectif_min', event.target.value ? Number.parseInt(event.target.value, 10) : undefined)}
                      placeholder="ex: 10"
                    />
                  </div>
                  <div className="formGroup">
                    <label>Effectif maximum</label>
                    <input
                      type="number"
                      min={0}
                      value={filters.effectif_max ?? ''}
                      onChange={(event) => updateFilter('effectif_max', event.target.value ? Number.parseInt(event.target.value, 10) : undefined)}
                      placeholder="ex: 100"
                    />
                    <span className="helperText">Valeur numérique prioritaire, puis tranche SIRENE.</span>
                  </div>
                </div>

                <div className="formRow">
                  <div className="formGroup">
                    <label>Zone de repli métropolitaine (Optionnel)</label>
                    <Select<ProspectSelectOption, false>
                      options={fallbackAreaOptions}
                      value={fallbackAreaOptions.find(o => o.value === (filters.code_postal_repli || '')) || fallbackAreaOptions[0]}
                      onChange={(option) => updateFilter('code_postal_repli', option?.value || undefined)}
                      styles={prospectSingleSelectStyles}
                      placeholder="Aucune zone de repli"
                      isSearchable={false}
                    />
                    <span className="helperText">
                      Si sélectionnée, le système complète la limite avec la même distance autour de cette métropole.
                    </span>
                  </div>
                </div>

                <div className="formRow">
                  <div className="formGroup">
                    <label>Limite</label>
                    <input
                      type="number"
                      min={1}
                      max={10000}
                      value={filters.limit || 5000}
                      onChange={(event) => updateFilter('limit', event.target.value ? Number.parseInt(event.target.value, 10) : undefined)}
                    />
                  </div>
                </div>
              </div>
            </fieldset>

            <div className="prospectInjection__actions">
              <Button style="grey" onClick={countProspects} disabled={isLoading}>
                {isLoading ? 'Calcul...' : 'Compter les résultats'}
              </Button>
              <Button style="gradient" onClick={() => void injectProspects()} disabled={isLoading || count === 0 || hasInjected}>
                {isLoading ? 'Injection...' : hasInjected ? 'Déjà injecté' : 'Injecter'}
              </Button>
            </div>
          </form>

        </div>
      </main>

      <Modal
        isVisible={countModalOpen}
        onClose={closeCountModal}
        title="Résultat du comptage"
      >
        <div className="prospectInjection__modal-count">
          <p className="prospectInjection__modal-count-number">
            {count !== null ? count.toLocaleString('fr-FR') : '...'}
          </p>
          <p>prospects correspondent aux filtres sélectionnés</p>
          <div className="prospectInjection__modal-actions">
            <Button style="grey" onClick={closeCountModal}>
              Fermer
            </Button>
            <Button style="gradient" onClick={() => { closeCountModal(); void injectProspects(); }} disabled={count === 0 || hasInjected}>
              Injecter
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isVisible={resultModalOpen}
        onClose={closeResultModal}
        title="Résultat de l'injection"
      >
        <div className="prospectInjection__modal-result">
          <p><strong>{result?.injected.toLocaleString('fr-FR')}</strong> prospects injectés</p>
          {result && result.skipped > 0 && (
            <p>{result.skipped.toLocaleString('fr-FR')} ignorés (déjà dans une file)</p>
          )}
          <div className="prospectInjection__modal-actions">
            <Button style="gradient" onClick={closeResultModal}>
              Fermer
            </Button>
          </div>
        </div>
      </Modal>

      <BackToTop />
    </div>
  );
}
