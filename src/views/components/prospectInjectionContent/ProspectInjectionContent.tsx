import type { ReactElement } from 'react';
import Select from 'react-select';
import type { ProspectInjectionPageViewModel } from '../../../hooks/index.ts';
import { MdArrowBack } from 'react-icons/md';
import { BackToTop, Button, Header, Modal, SubNav } from '../index.ts';
import { reactSelectStyles } from '../../../utils/styles/index.ts';

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
    maturityOptions,
    navigateBack,
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
                    <span className="helperText" style={{ fontSize: '0.8em', color: '#66b', marginTop: '0.25em', display: 'block', lineHeight: 1.4 }}>
                      Requis (5 chiffres). Point de départ pour l'injection par rayon progressif (jusqu'à 150km) avec tri en "porte-à-porte" (ville, rue, numéro).
                    </span>
                  </div>
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
                    <Select
                      options={typeOptions}
                      value={typeOptions.find(o => o.value === (filters.type_prospect || '')) || typeOptions[0]}
                      onChange={(option) => updateFilter('type_prospect', (option as typeof typeOptions[number] | null)?.value || '')}
                      styles={reactSelectStyles}
                      placeholder="Tous"
                      isSearchable={false}
                    />
                  </div>
                  <div className="formGroup">
                    <label>Maturité commerciale</label>
                    <Select
                      options={maturityOptions}
                      value={maturityOptions.find(o => o.value === (filters.maturite_commerciale || '')) || maturityOptions[0]}
                      onChange={(option) => updateFilter('maturite_commerciale', (option as typeof maturityOptions[number] | null)?.value || '')}
                      styles={reactSelectStyles}
                      placeholder="Tous"
                      isSearchable={false}
                    />
                  </div>
                </div>

                <div className="formRow">
                  <div className="formGroup">
                    <label>Source de prospect</label>
                    <Select
                      options={sourceOptions}
                      value={sourceOptions.find(o => o.value === (filters.source || '')) || sourceOptions[0]}
                      onChange={(option) => updateFilter('source', (option as typeof sourceOptions[number] | null)?.value || '')}
                      styles={reactSelectStyles}
                      placeholder="Tous"
                      isSearchable={false}
                    />
                  </div>
                  <div className="formGroup">
                    <label>Code NAF</label>
                    <input
                      type="text"
                      placeholder="ex: 7120B ou 71"
                      value={filters.code_naf || ''}
                      onChange={(e) => updateFilter('code_naf', e.target.value)}
                    />
                  </div>
                </div>

                <div className="formRow">
                  <div className="formGroup">
                    <label>Zone de repli métropolitaine (Optionnel)</label>
                    <Select
                      options={fallbackAreaOptions}
                      value={fallbackAreaOptions.find(o => o.value === (filters.code_postal_repli || '')) || fallbackAreaOptions[0]}
                      onChange={(option) => updateFilter('code_postal_repli', (option as typeof fallbackAreaOptions[number] | null)?.value || '')}
                      styles={reactSelectStyles}
                      placeholder="Aucune zone de repli"
                      isSearchable={false}
                    />
                    <span className="helperText" style={{ fontSize: '0.8em', color: '#66b', marginTop: '0.25em', display: 'block', lineHeight: 1.4 }}>
                      Si sélectionnée, le système basculera sur cette métropole si le rayon initial de 150km est épuisé.
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
                      onChange={(e) => updateFilter('limit', e.target.value)}
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
