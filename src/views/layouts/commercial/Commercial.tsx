import "../centreAppels/centreAppels.scss";

import type { ReactElement } from "react";
import { WithAuth } from '../../../utils/middleware/index.ts';
import { useCommercialPage } from '../../../hooks/index.ts';
import { CommercialHubContent } from "../../components/index.ts";

function Commercial(): ReactElement {
  return <CommercialHubContent viewModel={useCommercialPage()} />;
}

const CommercialWithAuth = WithAuth(Commercial);
export default CommercialWithAuth;
