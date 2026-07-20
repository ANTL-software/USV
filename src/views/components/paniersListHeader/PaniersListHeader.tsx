import type { ReactElement } from 'react';
import { IoAdd } from 'react-icons/io5';
import { MdArrowBack } from 'react-icons/md';
import { Button } from '../button/index.ts';

interface PaniersListHeaderProps { onBack: () => void; onCreate: () => void }

export function PaniersListHeader({ onBack, onCreate }: PaniersListHeaderProps): ReactElement {
  return (
    <>
      <div className="paniersList__back"><Button style="back" onClick={onBack}><MdArrowBack /><span>Retour aux produits</span></Button></div>
      <div className="paniersList__header"><div><h1>Paniers</h1><p className="paniersList__subtitle">Gérez les paniers de produits</p></div><div className="paniersList__actions"><Button style="gradient" onClick={onCreate}><IoAdd /> Nouveau panier</Button></div></div>
    </>
  );
}
