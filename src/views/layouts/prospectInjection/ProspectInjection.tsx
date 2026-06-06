import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Select from 'react-select';
import { useInjection } from '../../../hooks/useInjection';
import { useAlert } from '../../../context/alert/AlertContext';
import { getCampagneByIdService } from '../../../API/services/campagne.service';
import { MdArrowBack } from 'react-icons/md';
import WithAuth from '../../../utils/middleware/WithAuth';
import Header from '../../components/header/Header';
import SubNav from '../../components/subNav/SubNav';
import BackToTop from '../../components/backToTop/BackToTop';
import Modal from '../../components/modal/Modal';
import Button from '../../components/button/Button';
import reactSelectStyles from '../../../utils/styles/reactSelectStyles';
import type { InjectionFilters } from '../../../utils/types/queue.types';
import './prospectInjection.scss';

const ProspectionInjection = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showConfirm, showError } = useAlert();
  const { filters, setFilters, count, result, isLoading, loadCount, inject, reset } = useInjection();
  const campagneId = id ? parseInt(id, 10) : null;
  const [campagneNom, setCampagneNom] = useState<string>('');
  const [countModalOpen, setCountModalOpen] = useState(false);
  const [resultModalOpen, setResultModalOpen] = useState(false);
  const [hasInjected, setHasInjected] = useState(false);

  // Cleanup au unmount pour éviter les fuites de mémoire
  useEffect(() => {
    return () => {
      setCountModalOpen(false);
      setResultModalOpen(false);
      reset();
    };
  }, [reset]);

  useEffect(() => {
    if (!campagneId) return;
    getCampagneByIdService(campagneId)
      .then(c => setCampagneNom(c.toJSON().nom_campagne))
      .catch(() => {});
  }, [campagneId]);

  useEffect(() => {
    if (count !== null && !isLoading) {
      queueMicrotask(() => setCountModalOpen(true));
    }
  }, [count, isLoading]);

  useEffect(() => {
    if (result) {
      queueMicrotask(() => {
        setResultModalOpen(true);
        setHasInjected(true);
        // Réinitialiser les filtres et compteurs après injection réussie
        reset();
      });
    }
  }, [result, reset]);

  const handleCount = () => {
    if (!campagneId) return;
    if (!filters.code_postal || !/^\d{5}$/.test(filters.code_postal)) {
      showError('Un code postal de départ valide (5 chiffres) est requis.');
      return;
    }
    loadCount(campagneId);
  };

  const handleInject = async () => {
    if (!campagneId) return;
    if (!filters.code_postal || !/^\d{5}$/.test(filters.code_postal)) {
      showError('Un code postal de départ valide (5 chiffres) est requis.');
      return;
    }
    const confirmed = await showConfirm(
      `Injecter les prospects correspondants aux filtres dans cette campagne ?`,
      'Confirmer l\'injection'
    );
    if (confirmed) {
      await inject(campagneId);
    }
  };

  const updateFilter = (key: keyof InjectionFilters, value: string) => {
    if (['limit'].includes(key)) {
      const parsed = value ? parseInt(value, 10) : undefined;
      setFilters({ ...filters, [key]: parsed });
    } else {
      setFilters({ ...filters, [key]: value === '' ? undefined : value });
    }
    setHasInjected(false);
  };

  const typeProspectOptions: { value: string; label: string }[] = [
    { value: '', label: 'Tous' },
    { value: 'Particulier', label: 'Particulier' },
    { value: 'Entreprise', label: 'Entreprise' },
  ];

  const maturiteOptions: { value: string; label: string }[] = [
    { value: '', label: 'Tous' },
    { value: 'prospect', label: 'Prospect' },
    { value: 'client', label: 'Client' },
  ];

  const sourceOptions: { value: string; label: string }[] = [
    { value: '', label: 'Tous' },
    { value: 'import_csv', label: 'import_csv' },
    { value: 'import_legacy', label: 'import_legacy' },
    { value: 'manuel', label: 'manuel' },
  ];

  const repliOptions: { value: string; label: string }[] = [
    { value: '', label: 'Aucune zone de repli' },
    { value: '75001', label: 'Paris (75000)' },
    { value: '13001', label: 'Marseille (13000)' },
    { value: '69001', label: 'Lyon (69000)' },
    { value: '31000', label: 'Toulouse (31000)' },
    { value: '06000', label: 'Nice (06000)' },
    { value: '44000', label: 'Nantes (44000)' },
    { value: '67000', label: 'Strasbourg (67000)' },
    { value: '34000', label: 'Montpellier (34000)' },
    { value: '33000', label: 'Bordeaux (33000)' },
    { value: '59000', label: 'Lille (59000)' }
  ];

  return (
    <div id="prospectInjection">
      <Header />
      <SubNav />
      <main>
        <div className="prospectInjection__container">
          <div className="prospectInjection__header">
            <Button style="back" onClick={() => navigate('/operations/prospects')}>
              <MdArrowBack /> Retour
            </Button>
            <h2>Injecter des prospects dans la campagne #{id}{campagneNom ? ` — ${campagneNom}` : ''}</h2>
          </div>

          <form className="prospectInjection__form" onSubmit={(e) => { e.preventDefault(); handleCount(); }}>
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
                      options={typeProspectOptions}
                      value={typeProspectOptions.find(o => o.value === (filters.type_prospect || '')) || typeProspectOptions[0]}
                      onChange={(option) => updateFilter('type_prospect', (option as typeof typeProspectOptions[number] | null)?.value || '')}
                      styles={reactSelectStyles}
                      placeholder="Tous"
                      isSearchable={false}
                    />
                  </div>
                  <div className="formGroup">
                    <label>Maturité commerciale</label>
                    <Select
                      options={maturiteOptions}
                      value={maturiteOptions.find(o => o.value === (filters.maturite_commerciale || '')) || maturiteOptions[0]}
                      onChange={(option) => updateFilter('maturite_commerciale', (option as typeof maturiteOptions[number] | null)?.value || '')}
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
                      options={repliOptions}
                      value={repliOptions.find(o => o.value === (filters.code_postal_repli || '')) || repliOptions[0]}
                      onChange={(option) => updateFilter('code_postal_repli', (option as typeof repliOptions[number] | null)?.value || '')}
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
              <Button style="grey" onClick={handleCount} disabled={isLoading}>
                {isLoading ? 'Calcul...' : 'Compter les résultats'}
              </Button>
              <Button style="gradient" onClick={handleInject} disabled={isLoading || count === 0 || hasInjected}>
                {isLoading ? 'Injection...' : hasInjected ? 'Déjà injecté' : 'Injecter'}
              </Button>
            </div>
          </form>

        </div>
      </main>

      <Modal
        isVisible={countModalOpen}
        onClose={() => setCountModalOpen(false)}
        title="Résultat du comptage"
      >
        <div className="prospectInjection__modal-count">
          <p className="prospectInjection__modal-count-number">
            {count !== null ? count.toLocaleString('fr-FR') : '...'}
          </p>
          <p>prospects correspondent aux filtres sélectionnés</p>
          <div className="prospectInjection__modal-actions">
            <Button style="grey" onClick={() => setCountModalOpen(false)}>
              Fermer
            </Button>
            <Button style="gradient" onClick={() => { setCountModalOpen(false); handleInject(); }} disabled={count === 0 || hasInjected}>
              Injecter
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isVisible={resultModalOpen}
        onClose={() => setResultModalOpen(false)}
        title="Résultat de l'injection"
      >
        <div className="prospectInjection__modal-result">
          <p><strong>{result?.injected.toLocaleString('fr-FR')}</strong> prospects injectés</p>
          {result && result.skipped > 0 && (
            <p>{result.skipped.toLocaleString('fr-FR')} ignorés (déjà dans une file)</p>
          )}
          <div className="prospectInjection__modal-actions">
            <Button style="gradient" onClick={() => setResultModalOpen(false)}>
              Fermer
            </Button>
          </div>
        </div>
      </Modal>

      <BackToTop />
    </div>
  );
};

const ProspectInjectionWithAuth = WithAuth(ProspectionInjection);
export default ProspectInjectionWithAuth;
