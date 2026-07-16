import type { CSSProperties, ReactElement } from 'react';
import { IoPencil, IoTrash } from 'react-icons/io5';
import type { PostesListViewModel } from '../../../hooks/index.ts';
import { TYPE_LABELS, getPosteBadgeStyle } from '../../../utils/constants/index.ts';

interface PostesListTableProps { viewModel: PostesListViewModel }

export function PostesListTable({ viewModel }: PostesListTableProps): ReactElement {
  if (viewModel.isLoading) return <div className="postesList__loading">Chargement...</div>;
  return <div className="postesList__table-wrapper"><table className="postesList__table"><thead><tr><th>Libellé</th><th>Catégorie</th><th>Description</th><th>Actions</th></tr></thead><tbody>{viewModel.postes.map((poste) => <tr key={poste.id_poste}><td className="postesList__label">{poste.libelle_poste}</td><td>{poste.type_poste ? <span className={`postesList__badge${!poste.couleur ? ` postesList__badge--${poste.type_poste}` : ''}`} style={getPosteBadgeStyle(poste.couleur) as CSSProperties}>{TYPE_LABELS[poste.type_poste] ?? poste.type_poste}</span> : <span className="postesList__badge postesList__badge--autre">—</span>}</td><td className="postesList__desc">{poste.description || '—'}</td><td><div className="postesList__actions"><button type="button" className="postesList__btn-edit" onClick={() => viewModel.navigateToPoste(poste.id_poste)} title="Modifier"><IoPencil /></button><button type="button" className="postesList__btn-delete" onClick={() => { void viewModel.deletePoste(poste); }} title="Supprimer"><IoTrash /></button></div></td></tr>)}</tbody></table></div>;
}
