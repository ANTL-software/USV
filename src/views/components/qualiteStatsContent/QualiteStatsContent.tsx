import type { ReactElement } from 'react';
import type { QualiteStatsPageViewModel } from '../../../hooks/index.ts';
import {
  Button,
  Loader,
  QualiteStatsCharts,
  QualiteStatsOverview,
  QualiteStatsTable,
} from '../index.ts';

interface QualiteStatsContentProps {
  viewModel: QualiteStatsPageViewModel;
}

export function QualiteStatsContent({ viewModel }: QualiteStatsContentProps): ReactElement | null {
  if (viewModel.isLoading) {
    return <Loader message="Chargement des statistiques qualité..." />;
  }
  if (viewModel.error) {
    return (
      <section className="qualiteStats__panel qualiteStats__panel--error">
        <h2>Impossible de charger les statistiques</h2>
        <p>{viewModel.error}</p>
        <Button style="orange" onClick={() => void viewModel.reload()}>Réessayer</Button>
      </section>
    );
  }
  if (!viewModel.data || !viewModel.periodeSummary) return null;

  return (
    <>
      <QualiteStatsOverview {...viewModel} />
      <QualiteStatsCharts {...viewModel} />
      <QualiteStatsTable {...viewModel} />
    </>
  );
}
