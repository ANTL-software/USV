// styles
import './materielList.scss';

// hooks | library
import { ReactElement, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoLaptopOutline, IoAdd, IoPencil, IoReturnDownBack, IoPersonAdd, IoEye, IoEyeOff } from 'react-icons/io5';
import { MdArrowBack } from 'react-icons/md';
import Select from 'react-select';
import WithAuth from '../../../utils/middleware/WithAuth';
import reactSelectStyles from '../../../utils/styles/reactSelectStyles';

// hooks
import { useMateriel, useMarques } from '../../../hooks/useMateriel';
import { useEmployes } from '../../../hooks/useEmployes';

// types
import type {
  TypeMateriel,
  EtatMateriel,
  MaterielAffectation,
  CreateMaterielPayload,
  UpdateMaterielPayload,
} from '../../../utils/types/materiel.types';
import {
  TYPE_MATERIEL_OPTIONS,
  TYPE_MATERIEL_LABELS,
  ETAT_MATERIEL_OPTIONS,
  ETAT_MATERIEL_LABELS,
} from '../../../utils/types/materiel.types';
import type { MaterielModel } from '../../../API/models/materiel.model';

// components
import Header from '../../components/header/Header';
import SubNav from '../../components/subNav/SubNav';
import BackToTop from '../../components/backToTop/BackToTop';
import Button from '../../components/button/Button';
import CreatableSelectComponent from '../../components/creatableSelect/CreatableSelect';

// ─── Form state ───────────────────────────────────────────────────────────────

type MaterielModalMode = 'create' | 'edit';

interface MaterielFormState {
  nom_machine: string;
  marque: string;
  type_materiel: TypeMateriel;
  adresse_mac: string;
  numero_serie: string;
  rustdesk_id: string;
  rustdesk_password: string;
  notes: string;
}

const EMPTY_FORM: MaterielFormState = {
  nom_machine: '',
  marque: '',
  type_materiel: 'laptop',
  adresse_mac: '',
  numero_serie: '',
  rustdesk_id: '',
  rustdesk_password: '',
  notes: '',
};

// ─── Component ────────────────────────────────────────────────────────────────

function MaterielList(): ReactElement {
  const navigate = useNavigate();
  const { materiels, isLoading, error, fetchHistorique, create, update, affecter, restituer } = useMateriel();
  const { employes } = useEmployes();
  const { marques } = useMarques();

  // ── Materiel form modal ──
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<MaterielModalMode>('create');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<MaterielFormState>(EMPTY_FORM);
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // ── Historique dans le modal edit ──
  const [historique, setHistorique] = useState<MaterielAffectation[]>([]);
  const [isLoadingHistorique, setIsLoadingHistorique] = useState(false);

  // ── Affectation modal ──
  const [affectationModalOpen, setAffectationModalOpen] = useState(false);
  const [affectationTarget, setAffectationTarget] = useState<MaterielModel | null>(null);
  const [selectedEmployeId, setSelectedEmployeId] = useState<number | null>(null);
  const [affectationEtat, setAffectationEtat] = useState<EtatMateriel | null>(null);
  const [affectationNotes, setAffectationNotes] = useState('');
  const [isAffecting, setIsAffecting] = useState(false);

  // ── Restitution modal ──
  const [restitutionModalOpen, setRestitutionModalOpen] = useState(false);
  const [restitutionTarget, setRestitutionTarget] = useState<MaterielModel | null>(null);
  const [restitutionEtat, setRestitutionEtat] = useState<EtatMateriel | null>(null);
  const [isRestituting, setIsRestituting] = useState(false);

  const employeOptions = employes
    .filter(e => e.actif)
    .map(e => ({ value: e.id_employe, label: `${e.prenom} ${e.nom.toUpperCase()} (${e.identifiant})` }));

  // ── Open create modal ──────────────────────────────────────────────────────
  const openCreate = useCallback(() => {
    setForm(EMPTY_FORM);
    setShowPassword(false);
    setModalMode('create');
    setEditingId(null);
    setHistorique([]);
    setModalOpen(true);
  }, []);

  // ── Open edit modal ────────────────────────────────────────────────────────
  const openEdit = useCallback(async (m: MaterielModel) => {
    setForm({
      nom_machine:       m.nom_machine,
      marque:            m.marque ?? '',
      type_materiel:     m.type_materiel,
      adresse_mac:       m.adresse_mac ?? '',
      numero_serie:      m.numero_serie ?? '',
      rustdesk_id:       m.rustdesk_id ?? '',
      rustdesk_password: m.rustdesk_password ?? '',
      notes:             m.notes ?? '',
    });
    setShowPassword(false);
    setModalMode('edit');
    setEditingId(m.id_materiel);
    setHistorique([]);
    setModalOpen(true);

    // Charger l'historique en arrière-plan
    setIsLoadingHistorique(true);
    try {
      const data = await fetchHistorique(m.id_materiel);
      setHistorique(data);
    } catch {
      // silencieux — l'historique est optionnel
    } finally {
      setIsLoadingHistorique(false);
    }
  }, [fetchHistorique]);

  // ── Submit form ────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const payload = {
      nom_machine:       form.nom_machine.trim(),
      marque:            form.marque.trim() || undefined,
      type_materiel:     form.type_materiel,
      adresse_mac:       form.adresse_mac.trim() || undefined,
      numero_serie:      form.numero_serie.trim() || undefined,
      rustdesk_id:       form.rustdesk_id.trim() || undefined,
      rustdesk_password: form.rustdesk_password.trim() || undefined,
      notes:             form.notes.trim() || undefined,
    };

    let ok: boolean;
    if (modalMode === 'create') {
      ok = await create(payload as CreateMaterielPayload);
    } else {
      ok = await update(editingId!, payload as UpdateMaterielPayload);
    }

    setIsSaving(false);
    if (ok) setModalOpen(false);
  }, [form, modalMode, editingId, create, update]);

  // ── Open affectation modal ─────────────────────────────────────────────────
  const openAffectation = useCallback((m: MaterielModel) => {
    setAffectationTarget(m);
    setSelectedEmployeId(null);
    setAffectationEtat(null);
    setAffectationNotes('');
    setAffectationModalOpen(true);
  }, []);

  // ── Submit affectation ─────────────────────────────────────────────────────
  const handleAffecter = useCallback(async () => {
    if (!affectationTarget || !selectedEmployeId) return;
    setIsAffecting(true);
    const ok = await affecter(affectationTarget.id_materiel, {
      id_employe:       selectedEmployeId,
      etat_affectation: affectationEtat ?? undefined,
      notes:            affectationNotes.trim() || undefined,
    });
    setIsAffecting(false);
    if (ok) setAffectationModalOpen(false);
  }, [affectationTarget, selectedEmployeId, affectationEtat, affectationNotes, affecter]);

  // ── Open restitution modal ─────────────────────────────────────────────────
  const openRestitution = useCallback((m: MaterielModel) => {
    setRestitutionTarget(m);
    setRestitutionEtat(null);
    setRestitutionModalOpen(true);
  }, []);

  // ── Submit restitution ─────────────────────────────────────────────────────
  const handleRestituer = useCallback(async () => {
    if (!restitutionTarget) return;
    setIsRestituting(true);
    const ok = await restituer(restitutionTarget.id_materiel, {
      etat_restitution: restitutionEtat ?? undefined,
    });
    setIsRestituting(false);
    if (ok) setRestitutionModalOpen(false);
  }, [restitutionTarget, restitutionEtat, restituer]);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div id="materielList">
      <Header />
      <SubNav />
      <main>
        <div className="materielList__container">
          <div className="materielList__back">
            <Button style="back" onClick={() => navigate('/operations')}>
              <MdArrowBack />
              <span>Retour</span>
            </Button>
          </div>

          <div className="materielList__header">
            <div>
              <h1><IoLaptopOutline /> Matériel</h1>
              <p className="materielList__subtitle">{materiels.length} machine{materiels.length !== 1 ? 's' : ''} enregistrée{materiels.length !== 1 ? 's' : ''}</p>
            </div>
            <Button style="gradient" onClick={openCreate}>
              <IoAdd /> Ajouter un matériel
            </Button>
          </div>

          {error && <div className="materielList__error">{error}</div>}

          {isLoading ? (
            <div className="materielList__loading">Chargement...</div>
          ) : (
            <div className="materielList__table-wrapper">
              <table className="materielList__table">
                <thead>
                  <tr>
                    <th>Machine</th>
                    <th>Marque</th>
                    <th>Type</th>
                    <th>N° Série</th>
                    <th>Adresse MAC</th>
                    <th>RustDesk ID</th>
                    <th>Affecté à</th>
                    <th>Depuis</th>
                    <th>Notes</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {materiels.map(m => {
                    const affectation = m.affectationActive;
                    const employe = affectation?.employe ?? null;
                    const estAffecte = affectation !== null;
                    return (
                      <tr key={m.id_materiel} className={!m.actif ? 'materielList__row--inactive' : ''}>
                        <td className="materielList__nom">{m.nom_machine}</td>
                        <td>{m.marque ?? '—'}</td>
                        <td>
                          <span className={`materielList__badge materielList__badge--${m.type_materiel}`}>
                            {TYPE_MATERIEL_LABELS[m.type_materiel]}
                          </span>
                        </td>
                        <td><code>{m.numero_serie || '—'}</code></td>
                        <td><code>{m.adresse_mac || '—'}</code></td>
                        <td><code>{m.rustdesk_id || '—'}</code></td>
                        <td>
                          {employe
                            ? <span className="materielList__employe">{employe.prenom} {employe.nom.toUpperCase()}</span>
                            : <span className="materielList__libre">Libre</span>
                          }
                        </td>
                        <td>{affectation?.date_affectation ?? '—'}</td>
                        <td className="materielList__notes">{m.notes || '—'}</td>
                        <td className="materielList__actions">
                          <button
                            className="materielList__btn materielList__btn--edit"
                            onClick={() => openEdit(m)}
                            title="Modifier"
                          >
                            <IoPencil />
                          </button>
                          {!estAffecte && (
                            <button
                              className="materielList__btn materielList__btn--assign"
                              onClick={() => openAffectation(m)}
                              title="Affecter à un employé"
                            >
                              <IoPersonAdd />
                            </button>
                          )}
                          {estAffecte && (
                            <button
                              className="materielList__btn materielList__btn--return"
                              onClick={() => openRestitution(m)}
                              title="Restituer"
                            >
                              <IoReturnDownBack />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {materiels.length === 0 && (
                    <tr>
                      <td colSpan={10} className="materielList__empty">Aucun matériel enregistré</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* ── Modal matériel (create / edit) ── */}
      {modalOpen && (
        <div className="materielList__overlay" onClick={() => setModalOpen(false)}>
          <div className={`materielList__modal${modalMode === 'edit' ? ' materielList__modal--large' : ''}`} onClick={e => e.stopPropagation()}>
            <h2>{modalMode === 'create' ? 'Ajouter un matériel' : 'Modifier le matériel'}</h2>
            <form onSubmit={handleSubmit} className="materielList__form">
              <div className="materielList__formGrid">
                <div className="materielList__formRow">
                  <div className="materielList__formGroup">
                    <label>Nom de la machine *</label>
                    <input
                      type="text"
                      value={form.nom_machine}
                      onChange={e => setForm(f => ({ ...f, nom_machine: e.target.value }))}
                      required
                      placeholder="ex: Laptop-03-Salle-A"
                    />
                  </div>
                  <div className="materielList__formGroup">
                    <label>Marque</label>
                    <CreatableSelectComponent
                      value={form.marque}
                      onChange={v => setForm(f => ({ ...f, marque: v }))}
                      options={marques}
                      placeholder="Sélectionner ou créer..."
                    />
                  </div>
                </div>

                <div className="materielList__formRow">
                  <div className="materielList__formGroup">
                    <label>Type</label>
                    <Select
                      options={TYPE_MATERIEL_OPTIONS}
                      value={TYPE_MATERIEL_OPTIONS.find(o => o.value === form.type_materiel)}
                      onChange={opt => opt && setForm(f => ({ ...f, type_materiel: (opt as typeof TYPE_MATERIEL_OPTIONS[number]).value }))}
                      isSearchable={false}
                      className="react-select-container"
                      classNamePrefix="react-select"
                      menuPortalTarget={document.body}
                      styles={reactSelectStyles}
                    />
                  </div>
                  <div className="materielList__formGroup">
                    <label>Numéro de série</label>
                    <input
                      type="text"
                      value={form.numero_serie}
                      onChange={e => setForm(f => ({ ...f, numero_serie: e.target.value }))}
                      placeholder="ex: SN-ABC12345"
                    />
                  </div>
                </div>

                <div className="materielList__formRow">
                  <div className="materielList__formGroup">
                    <label>Adresse MAC</label>
                    <input
                      type="text"
                      value={form.adresse_mac}
                      onChange={e => setForm(f => ({ ...f, adresse_mac: e.target.value }))}
                      placeholder="ex: AA:BB:CC:DD:EE:FF"
                      maxLength={17}
                    />
                  </div>
                  <div className="materielList__formGroup">
                    <label>RustDesk ID</label>
                    <input
                      type="text"
                      value={form.rustdesk_id}
                      onChange={e => setForm(f => ({ ...f, rustdesk_id: e.target.value }))}
                      placeholder="ex: 123456789"
                    />
                  </div>
                </div>

                <div className="materielList__formRow">
                  <div className="materielList__formGroup">
                    <label>RustDesk Password (lifetime)</label>
                    <div className="materielList__password-wrap">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={form.rustdesk_password}
                        onChange={e => setForm(f => ({ ...f, rustdesk_password: e.target.value }))}
                        placeholder="Mot de passe permanent"
                      />
                      <button
                        type="button"
                        className="materielList__btn-eye"
                        onClick={() => setShowPassword(p => !p)}
                        tabIndex={-1}
                      >
                        {showPassword ? <IoEyeOff /> : <IoEye />}
                      </button>
                    </div>
                  </div>
                  <div className="materielList__formGroup">
                    <label>Notes</label>
                    <textarea
                      value={form.notes}
                      onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                      rows={3}
                      placeholder="Informations complémentaires..."
                    />
                  </div>
                </div>
              </div>

              {/* Historique d'affectations (mode edit uniquement) */}
              {modalMode === 'edit' && (
                <div className="materielList__historique">
                  <h3>Historique des affectations</h3>
                  {isLoadingHistorique ? (
                    <p className="materielList__historique-loading">Chargement...</p>
                  ) : historique.length === 0 ? (
                    <p className="materielList__historique-empty">Aucune affectation enregistrée.</p>
                  ) : (
                    <table className="materielList__historique-table">
                      <thead>
                        <tr>
                          <th>Employé</th>
                          <th>Du</th>
                          <th>Au</th>
                          <th>État départ</th>
                          <th>État retour</th>
                          <th>Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {historique.map(a => (
                          <tr key={a.id_affectation} className={!a.date_restitution ? 'materielList__historique-row--active' : ''}>
                            <td>
                              {a.employe
                                ? `${a.employe.prenom} ${a.employe.nom.toUpperCase()}`
                                : `#${a.id_employe}`
                              }
                            </td>
                            <td>{a.date_affectation}</td>
                            <td>{a.date_restitution ?? <span className="materielList__historique-actif">En cours</span>}</td>
                            <td>
                              {a.etat_affectation
                                ? <span className={`materielList__etat materielList__etat--${a.etat_affectation}`}>{ETAT_MATERIEL_LABELS[a.etat_affectation]}</span>
                                : '—'
                              }
                            </td>
                            <td>
                              {a.etat_restitution
                                ? <span className={`materielList__etat materielList__etat--${a.etat_restitution}`}>{ETAT_MATERIEL_LABELS[a.etat_restitution]}</span>
                                : '—'
                              }
                            </td>
                            <td className="materielList__historique-notes">{a.notes || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              <div className="materielList__modal-actions">
                <Button style="grey" onClick={() => setModalOpen(false)}>
                  Annuler
                </Button>
                <Button style="gradient" type="submit" disabled={isSaving}>
                  {isSaving ? 'Enregistrement...' : modalMode === 'create' ? 'Ajouter' : 'Enregistrer'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal affectation ── */}
      {affectationModalOpen && affectationTarget && (
        <div className="materielList__overlay" onClick={() => setAffectationModalOpen(false)}>
          <div className="materielList__modal" onClick={e => e.stopPropagation()}>
            <h2>Affecter "{affectationTarget.nom_machine}"</h2>
            <div className="materielList__form">
              <div className="materielList__formRow">
                <div className="materielList__formGroup">
                  <label>Employé *</label>
                  <Select
                    options={employeOptions}
                    value={employeOptions.find(o => o.value === selectedEmployeId) ?? null}
                    onChange={opt => setSelectedEmployeId((opt as { value: number; label: string } | null)?.value ?? null)}
                    placeholder="Sélectionner un employé..."
                    className="react-select-container"
                    classNamePrefix="react-select"
                    isSearchable
                    menuPortalTarget={document.body}
                    styles={reactSelectStyles}
                  />
                </div>
              </div>
              <div className="materielList__formRow">
                <div className="materielList__formGroup">
                  <label>État du matériel à la remise *</label>
                  <Select
                    options={ETAT_MATERIEL_OPTIONS}
                    value={ETAT_MATERIEL_OPTIONS.find(o => o.value === affectationEtat) ?? null}
                    onChange={opt => setAffectationEtat((opt as typeof ETAT_MATERIEL_OPTIONS[number] | null)?.value ?? null)}
                    placeholder="Sélectionner un état..."
                    className="react-select-container"
                    classNamePrefix="react-select"
                    menuPortalTarget={document.body}
                    styles={reactSelectStyles}
                  />
                </div>
              </div>
              <div className="materielList__formRow">
                <div className="materielList__formGroup">
                  <label>Notes</label>
                  <textarea
                    value={affectationNotes}
                    onChange={e => setAffectationNotes(e.target.value)}
                    rows={2}
                    placeholder="Remarques sur cette affectation..."
                  />
                </div>
              </div>
              <div className="materielList__modal-actions">
                <Button style="grey" onClick={() => setAffectationModalOpen(false)}>
                  Annuler
                </Button>
                <Button
                  style="gradient"
                  onClick={handleAffecter}
                  disabled={!selectedEmployeId || !affectationEtat || isAffecting}
                >
                  {isAffecting ? 'Affectation...' : 'Affecter'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal restitution ── */}
      {restitutionModalOpen && restitutionTarget && (
        <div className="materielList__overlay" onClick={() => setRestitutionModalOpen(false)}>
          <div className="materielList__modal" onClick={e => e.stopPropagation()}>
            <h2>Restituer "{restitutionTarget.nom_machine}"</h2>
            {restitutionTarget.employe && (
              <p className="materielList__current-assign">
                Actuellement assigné à : <strong>{restitutionTarget.employe.prenom} {restitutionTarget.employe.nom.toUpperCase()}</strong>
              </p>
            )}
            <div className="materielList__form">
              <div className="materielList__formRow">
                <div className="materielList__formGroup">
                  <label>État du matériel au retour *</label>
                  <Select
                    options={ETAT_MATERIEL_OPTIONS}
                    value={ETAT_MATERIEL_OPTIONS.find(o => o.value === restitutionEtat) ?? null}
                    onChange={opt => setRestitutionEtat((opt as typeof ETAT_MATERIEL_OPTIONS[number] | null)?.value ?? null)}
                    placeholder="Sélectionner un état..."
                    className="react-select-container"
                    classNamePrefix="react-select"
                    menuPortalTarget={document.body}
                    styles={reactSelectStyles}
                  />
                </div>
              </div>
              <div className="materielList__modal-actions">
                <Button style="grey" onClick={() => setRestitutionModalOpen(false)}>
                  Annuler
                </Button>
                <Button
                  style="gradient"
                  onClick={handleRestituer}
                  disabled={!restitutionEtat || isRestituting}
                >
                  {isRestituting ? 'Restitution...' : 'Confirmer la restitution'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <BackToTop />
    </div>
  );
}

const MaterielListWithAuth = WithAuth(MaterielList);
export default MaterielListWithAuth;
