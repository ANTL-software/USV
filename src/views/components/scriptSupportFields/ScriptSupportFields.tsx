import type { ScriptSupportEditorModel } from '../../../hooks/index.ts';
import { Button } from '../index.ts';
export function ScriptSupportFields({ editor }: { editor: ScriptSupportEditorModel }) {
  return <form onSubmit={editor.submit} className="scriptSupport__form">
    <h2>{editor.selected === null ? 'Ajouter un élément' : 'Modifier l’élément'}</h2>
    <fieldset disabled={editor.saving}>
      <div className="scriptSupport__field"><label htmlFor="support-titre">Titre</label><input id="support-titre" autoFocus required maxLength={255} value={editor.draft.titre} onChange={(event) => editor.change('titre', event.target.value)} /></div>
      {editor.kind === 'objections' && <>
        <div className="scriptSupport__field"><label htmlFor="support-categorie">Catégorie</label><input id="support-categorie" maxLength={255} value={editor.draft.categorie} onChange={(event) => editor.change('categorie', event.target.value)} /></div>
        <div className="scriptSupport__field"><label htmlFor="support-texte_objection">Objection du prospect</label><textarea id="support-texte_objection" rows={3} maxLength={30000} value={editor.draft.texte_objection} onChange={(event) => editor.change('texte_objection', event.target.value)} /></div>
        <div className="scriptSupport__field"><label htmlFor="support-reformulation">Reformulation</label><textarea id="support-reformulation" rows={3} maxLength={30000} value={editor.draft.reformulation} onChange={(event) => editor.change('reformulation', event.target.value)} /></div>
        <div className="scriptSupport__field"><label htmlFor="support-adaptation">Adaptation</label><textarea id="support-adaptation" rows={3} maxLength={30000} value={editor.draft.adaptation} onChange={(event) => editor.change('adaptation', event.target.value)} /></div>
      </>}
      <div className="scriptSupport__field"><label htmlFor="support-contenu">{editor.kind === 'objections' ? 'Réponse' : 'Contenu'}</label><textarea id="support-contenu" required rows={12} maxLength={30000} value={editor.draft.contenu} onChange={(event) => editor.change('contenu', event.target.value)} /></div>
      <p>Les retours à la ligne sont conservés.</p>
      <div className="scriptSupport__actions"><Button style="grey" type="button" onClick={editor.cancel}>Annuler</Button><Button style="gradient" type="submit">{editor.saving ? 'Enregistrement…' : 'Enregistrer'}</Button></div>
    </fieldset>
  </form>;
}
