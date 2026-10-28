import './monthlyCommercial.scss';
import { WithAuth } from '../../../utils/middleware/index.ts';
import { useMonthlyCommercial } from '../../../hooks/index.ts';
import { MonthlyCommercialContent } from '../../components/index.ts';
function MonthlyCommercial() { return <MonthlyCommercialContent viewModel={useMonthlyCommercial()} />; }
export default WithAuth(MonthlyCommercial);
