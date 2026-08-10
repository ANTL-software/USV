import type { ReactElement } from 'react';
import { IoCloudOutline, IoMicOutline } from 'react-icons/io5';
import type { QualiteEcoutesPageViewModel } from '../../../hooks/index.ts';

interface QualiteEcoutesConfigurationProps { viewModel: QualiteEcoutesPageViewModel }

const formatStorage = (bytes: number): string => bytes >= 1024 ** 3
  ? `${(bytes / 1024 ** 3).toFixed(1)} Go`
  : `${(bytes / 1024 ** 2).toFixed(1)} Mo`;

type StorageLevel = 'safe' | 'warning' | 'critical';

interface StoragePresentation {
  level: StorageLevel;
  label: string;
  recommendation: string;
}

const getStoragePresentation = (availablePercentage: number): StoragePresentation => {
  if (availablePercentage < 20) {
    return {
      level: 'critical',
      label: 'Stockage critique',
      recommendation: 'N’activez pas les enregistrements avant d’avoir libéré de l’espace.',
    };
  }

  if (availablePercentage < 40) {
    return {
      level: 'warning',
      label: 'Stockage à surveiller',
      recommendation: 'Évitez de réactiver les enregistrements sans libérer de l’espace.',
    };
  }

  return {
    level: 'safe',
    label: 'Stockage suffisant',
    recommendation: 'Les enregistrements peuvent être activés si nécessaire.',
  };
};

export function QualiteEcoutesConfiguration({ viewModel }: QualiteEcoutesConfigurationProps): ReactElement | null {
  const configuration = viewModel.operationsConfiguration;
  if (!configuration) return null;

  const disabled = viewModel.isUpdatingConfiguration || configuration.environmentLocked;
  const availablePercentage = Math.max(0, Math.min(100, 100 - configuration.storage.usedPercentage));
  const usedPercentage = Math.max(0, Math.min(100, configuration.storage.usedPercentage));
  const storage = getStoragePresentation(availablePercentage);

  return (
    <section className="qualiteEcoutes__configuration" aria-label="Configuration des enregistrements">
      <div className="qualiteEcoutes__configuration-heading">
        <IoMicOutline />
        <div>
          <h2>Enregistrements</h2>
          <p>{configuration.environmentLocked ? 'Verrouillé par la configuration serveur' : 'Réglages appliqués aux nouveaux appels'}</p>
        </div>
      </div>

      <div className="qualiteEcoutes__switches">
        <label className="qualiteEcoutes__switch">
          <span><strong>Enregistrer les appels</strong><small>Active ou coupe toute nouvelle capture audio.</small></span>
          <input type="checkbox" checked={configuration.enabled} disabled={disabled} onChange={(event) => viewModel.toggleRecordingEnabled(event.target.checked)} />
          <i aria-hidden="true" />
        </label>
        <label className="qualiteEcoutes__switch">
          <span><strong>Enregistrer les répondeurs</strong><small>Conserve aussi les appels classés répondeur.</small></span>
          <input type="checkbox" checked={configuration.answeringMachineEnabled} disabled={disabled || !configuration.enabled} onChange={(event) => viewModel.toggleAnsweringMachineRecording(event.target.checked)} />
          <i aria-hidden="true" />
        </label>
      </div>

      <div className={`qualiteEcoutes__storage qualiteEcoutes__storage--${storage.level}`}>
        <IoCloudOutline />
        <div>
          <span>Stockage disponible sur le serveur</span>
          <strong>{formatStorage(configuration.storage.availableBytes)} libres sur {formatStorage(configuration.storage.totalBytes)}</strong>
          <small>{availablePercentage.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} % libres · actualisation toutes les 30 s</small>
        </div>
        <div className="qualiteEcoutes__storage-gauge" aria-label={`${usedPercentage.toFixed(1)} % de stockage utilisé`}>
          <strong>{storage.label}</strong>
          <small>{storage.recommendation}</small>
          <div className="qualiteEcoutes__storage-track"><i style={{ width: `${usedPercentage}%` }} /></div>
        </div>
      </div>
    </section>
  );
}
