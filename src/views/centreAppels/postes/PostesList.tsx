// styles
import './postesList.scss';

// hooks | library
import { ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoPencil, IoTrash, IoAdd } from 'react-icons/io5';
import { MdArrowBack } from 'react-icons/md';
import WithAuth from '../../../utils/middleware/WithAuth';

// hooks
import { usePostes } from '../../../hooks/usePostes';

// constants
import { TYPE_LABELS, getPosteBadgeStyle } from '../../../utils/constants/poste.constants';

// components
import Header from '../../../components/header/Header';
import SubNav from '../../../components/subNav/SubNav';
import BackToTop from '../../../components/backToTop/BackToTop';
import Button from '../../../components/button/Button';

function PostesList(): ReactElement {
  const navigate = useNavigate();
  const { postes, isLoading, error, deletePoste } = usePostes();

  return (
    <div id="postesList">
      <Header />
      <SubNav />
      <main>
        <div className="postesList__container">
          <div className="postesList__back">
            <Button style="back" onClick={() => navigate('/operations')}>
              <MdArrowBack />
              <span>Retour</span>
            </Button>
          </div>

          <div className="postesList__header">
            <div>
              <h1>Postes</h1>
              <p className="postesList__subtitle">{postes.length} poste{postes.length !== 1 ? 's' : ''}</p>
            </div>
            <Button style="gradient" onClick={() => navigate('/operations/postes/new')}>
              <IoAdd /> Nouveau poste
            </Button>
          </div>

          {error && <div className="postesList__error">{error}</div>}

          {isLoading ? (
            <div className="postesList__loading">Chargement...</div>
          ) : (
            <div className="postesList__table-wrapper">
              <table className="postesList__table">
                <thead>
                  <tr>
                    <th>Libellé</th>
                    <th>Catégorie</th>
                    <th>Niveau</th>
                    <th>Description</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {postes.map(p => (
                    <tr key={p.id_poste}>
                      <td className="postesList__label">{p.libelle_poste}</td>
                      <td>
                        {p.type_poste ? (
                          <span
                            className={`postesList__badge${!p.couleur ? ` postesList__badge--${p.type_poste}` : ''}`}
                            style={getPosteBadgeStyle(p.couleur)}
                          >
                            {TYPE_LABELS[p.type_poste] ?? p.type_poste}
                          </span>
                        ) : (
                          <span className="postesList__badge postesList__badge--autre">—</span>
                        )}
                      </td>
                      <td>{p.niveau_hierarchique || '—'}</td>
                      <td className="postesList__desc">{p.description || '—'}</td>
                      <td>
                        <div className="postesList__actions">
                          <button
                            className="postesList__btn-edit"
                            onClick={() => navigate(`/operations/postes/${p.id_poste}`)}
                            title="Modifier"
                          >
                            <IoPencil />
                          </button>
                          <button
                            className="postesList__btn-delete"
                            onClick={() => deletePoste(p)}
                            title="Supprimer"
                          >
                            <IoTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
      <BackToTop />
    </div>
  );
}

const PostesListWithAuth = WithAuth(PostesList);
export default PostesListWithAuth;
