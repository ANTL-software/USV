import type { ReactElement } from 'react';
import { MdAdd, MdClose, MdFactCheck } from 'react-icons/md';
import Select from 'react-select';
import type { StylesConfig } from 'react-select';
import { QUOTE_CAMPAIGN_TYPE_LABELS } from '../../../utils/scripts/index.ts';
import { devisSelectStyles } from '../../../utils/styles/index.ts';
import type {
  QuoteCampaignType,
  QuoteCustomClause,
  QuoteProjectLine,
  QuoteProjectSection,
  QuoteThirdPartyService,
} from '../../../utils/types/index.ts';
import { Button } from '../button/index.ts';

interface DevisOfferCompositionProps {
  appointmentRate: number | undefined;
  campaignType: QuoteCampaignType;
  commercialCommissionRate: number | undefined;
  customClauses: QuoteCustomClause[];
  isProjectQuote: boolean;
  panelNumber: number;
  projectSections: QuoteProjectSection[];
  thirdPartyServices: QuoteThirdPartyService[];
  onAddCustomClause: () => void;
  onAddProjectLine: (sectionId: string) => void;
  onAddThirdPartyService: () => void;
  onAppointmentRateChange: (amount: number | undefined) => void;
  onCampaignTypeChange: (campaignType: QuoteCampaignType) => void;
  onCommercialCommissionRateChange: (rate: number | undefined) => void;
  onRemoveCustomClause: (clauseId: string) => void;
  onRemoveProjectLine: (sectionId: string, lineId: string) => void;
  onRemoveThirdPartyService: (serviceId: string) => void;
  onUpdateCustomClause: <Field extends keyof Omit<QuoteCustomClause, 'id'>>(
    clauseId: string,
    field: Field,
    value: QuoteCustomClause[Field],
  ) => void;
  onUpdateProjectLine: <Field extends keyof Omit<QuoteProjectLine, 'id'>>(
    sectionId: string,
    lineId: string,
    field: Field,
    value: QuoteProjectLine[Field],
  ) => void;
  onUpdateProjectSectionTitle: (sectionId: string, title: string) => void;
  onUpdateThirdPartyService: <Field extends keyof Omit<QuoteThirdPartyService, 'id'>>(
    serviceId: string,
    field: Field,
    value: QuoteThirdPartyService[Field],
  ) => void;
}

type CampaignTypeOption = {
  label: string;
  value: QuoteCampaignType;
};

const campaignTypeOptions: CampaignTypeOption[] = Object.entries(QUOTE_CAMPAIGN_TYPE_LABELS).map(([value, label]) => ({
  value: value as QuoteCampaignType,
  label,
}));

const getOptionalAmount = (value: string): number | undefined => (value === '' ? undefined : Number(value));

export function DevisOfferComposition({
  appointmentRate,
  campaignType,
  commercialCommissionRate,
  customClauses,
  isProjectQuote,
  panelNumber,
  projectSections,
  thirdPartyServices,
  onAddCustomClause,
  onAddProjectLine,
  onAddThirdPartyService,
  onAppointmentRateChange,
  onCampaignTypeChange,
  onCommercialCommissionRateChange,
  onRemoveCustomClause,
  onRemoveProjectLine,
  onRemoveThirdPartyService,
  onUpdateCustomClause,
  onUpdateProjectLine,
  onUpdateProjectSectionTitle,
  onUpdateThirdPartyService,
}: DevisOfferCompositionProps): ReactElement {
  if (isProjectQuote) {
    return (
      <article className="devisView__panel">
        <div className="devisView__panel-header">
          <MdFactCheck />
          <div>
            <h2>{panelNumber}. Composition du projet</h2>
            <p>Chiffrez chaque brique du projet. Les lignes renseignées seront reprises dans le devis détaillé.</p>
          </div>
        </div>

        <div className="devisView__project-sections">
          <p className="devisView__project-description-help">Dans chaque description, une ligne correspond à une puce dans le devis.</p>
          {projectSections.map((section) => (
            <section key={section.id} className="devisView__project-section">
              <div className="devisView__project-section-heading">
                <input
                  aria-label="Intitulé de la phase"
                  placeholder={section.titlePlaceholder || 'Intitulé de la phase'}
                  value={section.title}
                  onChange={(event) => onUpdateProjectSectionTitle(section.id, event.target.value)}
                />
                <span>{section.lines.filter((line) => line.included || line.amount !== undefined).length} prestation(s) retenue(s)</span>
              </div>

              <div className="devisView__project-lines">
                {section.lines.map((line) => (
                  <article key={line.id} className={`devisView__project-line ${line.included || line.amount !== undefined ? 'is-active' : ''}`}>
                    <div className="devisView__project-line-content">
                      <input
                        aria-label="Intitulé de la prestation"
                        placeholder={line.labelPlaceholder || 'Intitulé de la prestation'}
                        value={line.label}
                        onChange={(event) => onUpdateProjectLine(section.id, line.id, 'label', event.target.value)}
                      />
                      <textarea
                        aria-label="Description de la prestation"
                        placeholder={line.descriptionPlaceholder || 'Description, livrables et périmètre'}
                        value={line.description}
                        onChange={(event) => onUpdateProjectLine(section.id, line.id, 'description', event.target.value)}
                      />
                    </div>
                    <div className="devisView__project-line-controls">
                      <label>
                        <span>Montant HT</span>
                        <div>
                          <input
                            disabled={line.included}
                            min="0"
                            step="1"
                            type="number"
                            value={line.amount ?? ''}
                            onChange={(event) => onUpdateProjectLine(section.id, line.id, 'amount', getOptionalAmount(event.target.value))}
                          />
                          <small>€</small>
                        </div>
                      </label>
                      <label className="devisView__included-toggle">
                        <input
                          type="checkbox"
                          checked={line.included}
                          onChange={(event) => onUpdateProjectLine(section.id, line.id, 'included', event.target.checked)}
                        />
                        <span>Inclus</span>
                      </label>
                      {line.isCustom && (
                        <button type="button" aria-label="Supprimer la prestation" onClick={() => onRemoveProjectLine(section.id, line.id)}>
                          <MdClose />
                        </button>
                      )}
                    </div>
                  </article>
                ))}
              </div>

              <Button style="white" className="devisView__add-clause" onClick={() => onAddProjectLine(section.id)}>
                <MdAdd />
                <span>Ajouter une prestation</span>
              </Button>
            </section>
          ))}
        </div>

        <div className="devisView__third-party-services">
          <strong>Services & abonnements tiers à la charge du client</strong>
          <span>Ils seront listés sur la dernière page du devis.</span>
          <div className="devisView__third-party-editor">
            {thirdPartyServices.map((service) => (
              <div key={service.id}>
                <input
                  aria-label="Nom du service tiers"
                  placeholder="Service tiers"
                  value={service.label}
                  onChange={(event) => onUpdateThirdPartyService(service.id, 'label', event.target.value)}
                />
                <input
                  aria-label="Description du service tiers"
                  placeholder="Description et prise en charge"
                  value={service.description}
                  onChange={(event) => onUpdateThirdPartyService(service.id, 'description', event.target.value)}
                />
                <button type="button" aria-label="Supprimer le service tiers" onClick={() => onRemoveThirdPartyService(service.id)}>
                  <MdClose />
                </button>
              </div>
            ))}
          </div>
          <Button style="white" className="devisView__add-clause" onClick={onAddThirdPartyService}>
            <MdAdd />
            <span>Ajouter un service tiers</span>
          </Button>
        </div>
      </article>
    );
  }

  return (
    <article className="devisView__panel">
      <div className="devisView__panel-header">
        <MdFactCheck />
        <div>
          <h2>{panelNumber}. Composition de l’offre</h2>
          <p>Définissez le modèle de rémunération adapté à la campagne.</p>
        </div>
      </div>

      <label className="devisView__field devisView__campaign-type">
        <span>Type de campagne</span>
        <Select<CampaignTypeOption, false>
          className="react-select-container"
          classNamePrefix="react-select"
          isSearchable={false}
          menuPlacement="top"
          menuPortalTarget={document.body}
          menuPosition="fixed"
          options={campaignTypeOptions}
          styles={devisSelectStyles as StylesConfig<CampaignTypeOption, false>}
          value={campaignTypeOptions.find((option) => option.value === campaignType) ?? null}
          onChange={(option) => option && onCampaignTypeChange(option.value)}
        />
      </label>

      {campaignType === 'commercial' ? (
        <div className="devisView__pricing-model">
          <div className="devisView__section-title">
            <strong>Commission commerciale</strong>
            <span>Le pourcentage est appliqué au montant HT de chaque vente conclue.</span>
          </div>
          <label className="devisView__pricing-line">
            <span>Commission par vente</span>
            <div>
              <input
                min="0"
                max="100"
                step="0.01"
                type="number"
                value={commercialCommissionRate ?? ''}
                onChange={(event) => onCommercialCommissionRateChange(getOptionalAmount(event.target.value))}
              />
              <small>%</small>
            </div>
          </label>
        </div>
      ) : (
        <div className="devisView__pricing-model">
          <div className="devisView__section-title">
            <strong>Tarification au rendez-vous qualifié</strong>
            <span>Définissez le tarif unitaire, puis ajoutez les conditions particulières nécessaires.</span>
          </div>
          <label className="devisView__pricing-line">
            <span>Rendez-vous pris</span>
            <div>
              <input
                min="0"
                step="1"
                type="number"
                value={appointmentRate ?? ''}
                onChange={(event) => onAppointmentRateChange(getOptionalAmount(event.target.value))}
              />
              <small>€ HT</small>
            </div>
          </label>

          <div className="devisView__custom-clauses">
            {customClauses.map((clause) => (
              <div key={clause.id} className={`devisView__custom-clause ${clause.included || clause.amount !== undefined ? 'is-active' : ''}`}>
                <input
                  aria-label="Intitulé de la clause"
                  placeholder="Clause tarifaire"
                  value={clause.label}
                  onChange={(event) => onUpdateCustomClause(clause.id, 'label', event.target.value)}
                />
                <input
                  aria-label="Montant de la clause"
                  disabled={clause.included}
                  min="0"
                  step="1"
                  type="number"
                  value={clause.amount ?? ''}
                  onChange={(event) => onUpdateCustomClause(clause.id, 'amount', getOptionalAmount(event.target.value))}
                />
                <label>
                  <input
                    type="checkbox"
                    checked={clause.included}
                    onChange={(event) => onUpdateCustomClause(clause.id, 'included', event.target.checked)}
                  />
                  <span>Inclus</span>
                </label>
                <button type="button" aria-label="Supprimer la clause" onClick={() => onRemoveCustomClause(clause.id)}>
                  <MdClose />
                </button>
              </div>
            ))}
          </div>

          <Button style="white" className="devisView__add-clause" onClick={onAddCustomClause}>
            <MdAdd />
            <span>Ajouter une clause</span>
          </Button>
        </div>
      )}
    </article>
  );
}
