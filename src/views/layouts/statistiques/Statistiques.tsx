import './statistiques.scss';
import { WithAuth } from '../../../utils/middleware/index.ts';
import { useStatistiquesPage } from '../../../hooks/index.ts';
import { StatistiquesHubContent } from '../../components/index.ts';

function Statistiques() {
  return <StatistiquesHubContent viewModel={useStatistiquesPage()} />;
}
export default WithAuth(Statistiques);
