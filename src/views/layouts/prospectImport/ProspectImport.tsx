import './prospectImport.scss';
import { ReactElement, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdArrowBack, MdCloudUpload } from 'react-icons/md';
import WithAuth from '../../../utils/middleware/WithAuth';
import { useProspectImport } from '../../../hooks/useProspectImport';
import Header from '../../components/header/Header';
import SubNav from '../../components/subNav/SubNav';
import BackToTop from '../../components/backToTop/BackToTop';
import Button from '../../components/button/Button';

const PREVIEW_LIMIT = 5;

function ProspectImport(): ReactElement {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const {
    rows, parseError, isImporting, result, importError,
    handleFile, handleImport, reset,
  } = useProspectImport();

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div id="prospectImport">
      <Header />
      <SubNav />
      <main>
        <div className="prospectImport__container">
          <div className="prospectImport__back">
            <button onClick={() => navigate('/home')}><MdArrowBack /> Retour</button>
          </div>

          <h1>Import de prospects</h1>
          <p className="prospectImport__subtitle">Importez jusqu'à 1 000 prospects depuis un fichier CSV.</p>

          <div className="prospectImport__format">
            <h3>Format attendu (CSV — séparateur virgule ou point-virgule)</h3>
            <code>nom,prenom,telephone,email,type_prospect,raison_sociale,adresse,code_postal,ville,pays,notes,siret,secteur,region,civilite</code>
            <p>Colonnes obligatoires : <strong>nom</strong> et <strong>telephone</strong>. Les doublons (même téléphone) sont ignorés automatiquement.</p>
          </div>

          {!result && (
            <>
              <label
                className={`prospectImport__dropzone${dragging ? ' prospectImport__dropzone--active' : ''}`}
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="prospectImport__dropzone-icon"><MdCloudUpload /></div>
                <p>Glissez un fichier CSV ici ou cliquez pour sélectionner</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,text/csv"
                  onChange={onFileChange}
                />
              </label>

              {parseError && <div className="prospectImport__parse-error">{parseError}</div>}

              {rows.length > 0 && (
                <>
                  <div className="prospectImport__preview">
                    <h3>{rows.length} ligne{rows.length > 1 ? 's' : ''} détectée{rows.length > 1 ? 's' : ''} — aperçu ({Math.min(rows.length, PREVIEW_LIMIT)} premières)</h3>
                    <table className="prospectImport__preview-table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Nom</th>
                          <th>Prénom</th>
                          <th>Téléphone</th>
                          <th>Email</th>
                          <th>Type</th>
                          <th>Ville</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.slice(0, PREVIEW_LIMIT).map((r, i) => (
                          <tr key={i}>
                            <td>{i + 1}</td>
                            <td>{r.nom}</td>
                            <td>{r.prenom ?? '—'}</td>
                            <td>{r.telephone}</td>
                            <td>{r.email ?? '—'}</td>
                            <td>{r.type_prospect ?? 'Particulier'}</td>
                            <td>{r.ville ?? '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {rows.length > PREVIEW_LIMIT && (
                      <div className="prospectImport__preview-more">
                        ... et {rows.length - PREVIEW_LIMIT} autre{rows.length - PREVIEW_LIMIT > 1 ? 's' : ''} ligne{rows.length - PREVIEW_LIMIT > 1 ? 's' : ''}
                      </div>
                    )}
                  </div>

                  <div className="prospectImport__actions">
                    <Button style="gradient" onClick={handleImport} disabled={isImporting}>
                      {isImporting ? 'Import en cours...' : `Importer ${rows.length} prospect${rows.length > 1 ? 's' : ''}`}
                    </Button>
                    <button type="button" onClick={reset} style={{ background: 'none', border: '1px solid #ccc', borderRadius: 4, padding: '0.5rem 1rem', cursor: 'pointer' }}>
                      Annuler
                    </button>
                  </div>
                </>
              )}

              {importError && <div className="prospectImport__import-error">{importError}</div>}
            </>
          )}

          {result && (
            <div className="prospectImport__result">
              <h2>Résultats de l'import</h2>
              <div className="prospectImport__result-stats">
                <div className="prospectImport__stat prospectImport__stat--created">
                  <span>{result.created}</span>
                  <span>Créés</span>
                </div>
                <div className="prospectImport__stat prospectImport__stat--skipped">
                  <span>{result.skipped}</span>
                  <span>Doublons ignorés</span>
                </div>
                <div className="prospectImport__stat prospectImport__stat--errors">
                  <span>{result.errors.length}</span>
                  <span>Erreurs</span>
                </div>
              </div>

              {result.errors.length > 0 && (
                <div className="prospectImport__result-errors">
                  <h4>Détail des erreurs</h4>
                  <ul>
                    {result.errors.map((e, i) => (
                      <li key={i}><strong>Ligne {e.ligne}</strong>{e.message}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
                <Button style="grey" onClick={reset}>Nouvel import</Button>
                <button type="button" onClick={() => navigate('/home')} style={{ background: 'none', border: '1px solid #ccc', borderRadius: 4, padding: '0.5rem 1rem', cursor: 'pointer' }}>
                  Retour à l'accueil
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
      <BackToTop />
    </div>
  );
}

const ProspectImportWithAuth = WithAuth(ProspectImport);
export default ProspectImportWithAuth;
