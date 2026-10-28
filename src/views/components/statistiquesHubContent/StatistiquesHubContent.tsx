import { IoStatsChartOutline } from 'react-icons/io5';
import { MdArrowBack } from 'react-icons/md';
import type { StatistiquesPageViewModel } from '../../../hooks/index.ts';
import { BackToTop, Button, Header, SubNav } from '../index.ts';

export function StatistiquesHubContent({ viewModel }: { viewModel: StatistiquesPageViewModel }) {
  return <div id="statistiques">
    <Header /><SubNav />
    <main>
      <div className="statistiques__back"><Button style="back" onClick={viewModel.navigateBack}><MdArrowBack /><span>Retour</span></Button></div>
      <div className="statistiques__wrapper">
        <h1>Statistiques</h1>
        <div className="statistiques__row">
          {viewModel.entries.map((entry) => <button type="button" key={entry.path} className="statistiques__card" onClick={() => viewModel.navigateTo(entry.path)}>
            <div className="statistiques__card-icon"><IoStatsChartOutline /></div>
            <h2>{entry.title}</h2><p>{entry.description}</p>
          </button>)}
        </div>
      </div>
    </main><BackToTop />
  </div>;
}
