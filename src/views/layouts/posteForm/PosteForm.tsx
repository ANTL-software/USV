import './posteForm.scss';
import type { ReactElement } from 'react';
import { usePosteForm } from '../../../hooks/index.ts';
import { WithAuth } from '../../../utils/middleware/index.ts';
import { PosteFormContent } from '../../components/index.ts';

function PosteForm(): ReactElement {
  return <PosteFormContent viewModel={usePosteForm()} />;
}

const PosteFormWithAuth = WithAuth(PosteForm);
export default PosteFormWithAuth;
