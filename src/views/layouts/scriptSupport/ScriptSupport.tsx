import { useScriptSupportEditor } from '../../../hooks/index.ts';
import { WithAuth } from '../../../utils/middleware/index.ts';
import { Header, SubNav, BackToTop, Button, ScriptSupportFields } from '../../components/index.ts';
import './scriptSupport.scss';
function ScriptSupport() {
  const editor = useScriptSupportEditor();
  return <div id="scriptSupport"><Header /><SubNav /><main className="scriptSupport__container">
    <Button style="back" onClick={editor.back} disabled={editor.saving}>Retour à la campagne</Button>
    <h1>{editor.title}</h1><p>{editor.data?.nom_campagne}</p>
    {editor.error && <p role="alert" className="scriptSupport__error">{editor.error}</p>}
    {editor.success && <p role="status" className="scriptSupport__success">{editor.success}</p>}
    {editor.loading ? <p>Chargement…</p> : editor.data && <>
      {editor.data.source === 'historique' && <p className="scriptSupport__notice">Contenu historique de Script. Votre premier enregistrement personnalisera ce support pour cette campagne.</p>}
      <div className="scriptSupport__toolbar"><p>{editor.data.items.length} élément(s), dans l’ordre de présentation</p><Button style="gradient" onClick={() => editor.edit(null)} disabled={editor.saving || editor.data.items.length >= 200}>Ajouter un élément</Button></div>
      <div className="scriptSupport__layout"><section aria-label="Contenu du support" className="scriptSupport__list">
        {editor.data.items.length === 0 && <p>Aucun contenu. Ajoutez votre premier élément.</p>}
        {editor.data.items.map((item, index) => <article className="scriptSupport__item" key={index}>
          <h2>{index + 1}. {item.titre}</h2>{item.categorie && <p>{item.categorie}</p>}
          {item.texte_objection && <p className="scriptSupport__text">{item.texte_objection}</p>}
          {item.reformulation && <p className="scriptSupport__text"><strong>Reformulation : </strong>{item.reformulation}</p>}
          {item.adaptation && <p className="scriptSupport__text"><strong>Adaptation : </strong>{item.adaptation}</p>}
          <p className="scriptSupport__text">{item.contenu}</p>
          <div className="scriptSupport__actions">
            <Button style="grey" disabled={editor.saving || index === 0} onClick={() => editor.move(index, -1)} aria-label={`Monter ${item.titre}`}>↑</Button>
            <Button style="grey" disabled={editor.saving || index === editor.data!.items.length - 1} onClick={() => editor.move(index, 1)} aria-label={`Descendre ${item.titre}`}>↓</Button>
            <Button style="gradient" disabled={editor.saving} onClick={() => editor.edit(index)}>Modifier</Button>
            <Button style="red" disabled={editor.saving} onClick={() => editor.remove(index)}>Supprimer</Button>
          </div>
        </article>)}
      </section>{editor.editing && <ScriptSupportFields editor={editor} />}</div>
    </>}
  </main><BackToTop /></div>;
}
const AuthenticatedScriptSupport = WithAuth(ScriptSupport);
export default function ScriptSupportRoute() {
  return <AuthenticatedScriptSupport />;
}
