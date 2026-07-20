import { useRef } from 'react';
import type { ReactElement } from 'react';
import { MdCloudUpload } from 'react-icons/md';
import type { ProspectImportPageViewModel } from '../../../hooks/index.ts';

interface ProspectImportDropzoneProps { viewModel: ProspectImportPageViewModel }

export function ProspectImportDropzone({ viewModel }: ProspectImportDropzoneProps): ReactElement {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const openFilePicker = (): void => fileInputRef.current?.click();
  return (
    <div className={`prospectImport__dropzone${viewModel.isDragging ? ' prospectImport__dropzone--active' : ''}`} onDragOver={viewModel.startDragging} onDragLeave={viewModel.stopDragging} onDrop={viewModel.dropFile} onClick={openFilePicker} role="button" tabIndex={0} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') openFilePicker(); }}>
      <div className="prospectImport__dropzone-icon"><MdCloudUpload /></div><p>Glissez un fichier CSV ici ou cliquez pour sélectionner</p>
      <input ref={fileInputRef} type="file" accept=".csv,text/csv" onChange={viewModel.selectFile} />
    </div>
  );
}
