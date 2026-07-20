import assert from 'node:assert/strict';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import test, { mock } from 'node:test';

import type {
  AntlConfiguration,
  AntlConfigurationLogoDeleteResult,
  AntlConfigurationLogoUploadResult,
  AntlConfigurationRibDeleteResult,
  AntlConfigurationRibUploadResult,
  UpdateAntlConfigurationData,
} from '../../src/utils/types/index.ts';

interface ApiEnvelope<T> {
  success: boolean;
  data?: T;
  message?: string;
}

interface ApiResponse<T> {
  data: T;
}

let configuration: AntlConfiguration = {
  id_configuration: 1,
  company_name: 'antl',
  forme_juridique: null,
  capital_social: null,
  rcs_ville: null,
  siret: null,
  tva_intracom: null,
  email_contact: null,
  telephone: null,
  website: 'https://antl.fr',
  adresse: null,
  code_postal: null,
  ville: null,
  pays: 'France',
  footer_text: null,
  conditions_paiement: null,
  delai_paiement_jours: null,
  penalite_retard: null,
  option_tva_debits: false,
  bank_account_holder: null,
  bank_name: null,
  iban: null,
  bic: null,
  logo_path: null,
  logo_file_name: null,
  rib_path: null,
  rib_file_name: null,
};
const requests: Array<{ method: string; url: string; customName?: string | null }> = [];

const apiModuleUrl = pathToFileURL(path.resolve('src/API/APICalls.ts')).href;
mock.module(apiModuleUrl, {
  namedExports: {
    getRequest: async (url: string): Promise<ApiResponse<ApiEnvelope<AntlConfiguration>>> => {
      requests.push({ method: 'GET', url });
      return { data: { success: true, data: configuration } };
    },
    putRequest: async (url: string, payload: UpdateAntlConfigurationData): Promise<ApiResponse<ApiEnvelope<AntlConfiguration>>> => {
      requests.push({ method: 'PUT', url });
      configuration = { ...configuration, ...payload };
      return { data: { success: true, data: configuration } };
    },
    postFormDataRequest: async (url: string, formData: FormData): Promise<ApiResponse<AntlConfigurationLogoUploadResult | AntlConfigurationRibUploadResult>> => {
      const customName = formData.get('customName');
      requests.push({
        method: 'POST_FORM',
        url,
        customName: typeof customName === 'string' ? customName : null,
      });
      if (url.endsWith('/logo')) {
        configuration = { ...configuration, logo_path: '/uploads/logo.png', logo_file_name: 'logo-antl' };
        return { data: { success: true, data: { logo_path: '/uploads/logo.png', logo_file_name: 'logo-antl' } } };
      }
      configuration = { ...configuration, rib_path: '/uploads/rib.pdf', rib_file_name: 'rib-antl' };
      return { data: { success: true, data: { rib_path: '/uploads/rib.pdf', rib_file_name: 'rib-antl' } } };
    },
    deleteRequest: async (url: string): Promise<ApiResponse<AntlConfigurationLogoDeleteResult | AntlConfigurationRibDeleteResult>> => {
      requests.push({ method: 'DELETE', url });
      if (url.endsWith('/logo')) configuration = { ...configuration, logo_path: null, logo_file_name: null };
      if (url.endsWith('/rib')) configuration = { ...configuration, rib_path: null, rib_file_name: null };
      return { data: { success: true } };
    },
  },
});

test('le workflow configuration met à jour les données et gère logo et RIB', async () => {
  const {
    deleteAntlConfigurationLogoService,
    deleteAntlConfigurationRibService,
    getAntlConfigurationService,
    updateAntlConfigurationService,
    uploadAntlConfigurationLogoService,
    uploadAntlConfigurationRibService,
  } = await import('../../src/API/services/antlConfiguration.service.ts');

  assert.equal((await getAntlConfigurationService()).company_name, 'antl');
  const updated = await updateAntlConfigurationService({
    company_name: 'ANTL SAS',
    delai_paiement_jours: 30,
  });
  assert.equal(updated.company_name, 'ANTL SAS');
  assert.equal(updated.delai_paiement_jours, 30);

  const logo = new File([new Uint8Array([1])], 'logo.png', { type: 'image/png' });
  const rib = new File([new Uint8Array([2])], 'rib.pdf', { type: 'application/pdf' });
  assert.equal((await uploadAntlConfigurationLogoService(logo, 'logo-antl')).data.logo_file_name, 'logo-antl');
  assert.equal((await uploadAntlConfigurationRibService(rib, 'rib-antl')).data.rib_file_name, 'rib-antl');
  await deleteAntlConfigurationLogoService();
  await deleteAntlConfigurationRibService();

  assert.deepEqual(requests, [
    { method: 'GET', url: '/antl-configuration' },
    { method: 'PUT', url: '/antl-configuration' },
    { method: 'POST_FORM', url: '/antl-configuration/logo', customName: 'logo-antl' },
    { method: 'POST_FORM', url: '/antl-configuration/rib', customName: 'rib-antl' },
    { method: 'DELETE', url: '/antl-configuration/logo' },
    { method: 'DELETE', url: '/antl-configuration/rib' },
  ]);
  assert.equal(configuration.logo_path, null);
  assert.equal(configuration.rib_path, null);
});
