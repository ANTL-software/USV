export {
  CAMPAIGN_VARIANT_OPTIONS,
  CAMPAIGN_VARIANTS,
  getCampaignVariantLabel,
  normalizeCampaignVariant,
} from './campaignVariants.ts';
export type { CampaignVariant } from './campaignVariants.ts';
export { formatLeadClientReference } from './leadClients.ts';
export {
  COMMANDES_PERIOD_OPTIONS,
  COMMANDES_VIEW_OPTIONS,
  buildLeadCommandesSummary,
  buildSaleCommandesSummary,
  formatDate as formatCommandesDate,
  formatLeadSlot,
  formatMontant,
  getLeadAgentName,
  getLeadInterlocuteur,
  getLeadProspectName,
  getMonthBounds,
  isDateAfterPeriod,
  isDateBeforePeriod,
  isFrigoReminderDue,
  getVenteAgentName,
  getVenteProspectName,
} from './commandesList.ts';
export type { CommandesPeriodPreset, CommandesSummaryCard, CommandesViewMode, DateBounds } from './commandesList.ts';
export {
  formatCallDuration,
  formatDate,
  formatDateShort,
  formatDurationFromSeconds,
  formatSince,
  formatTime,
  getStatutAppelClass,
  getStatutAppelLabel,
} from './formatters.ts';
export {
  SECTIONS_CONFIG,
  getAllowedSections,
  getFirstAllowedPath,
  hasAccessToSection,
  hasAccessToSubsection,
  hasAccessToPath,
} from './permissions.ts';
export {
  getLegacyOptoutLabel,
  getProspectCampaignStatusHeading,
  getProspectStatusHeading,
  isProspectGloballyFlagged,
} from './prospectStatus.ts';
export {
  formatPhoneNumber,
  getApiBaseUrl,
  getCampagneLogoUrl,
  getEmployePhotoUrl,
  getGreetingName,
  getSalutation,
  getErrorMessage,
  isTestEnvironment,
  logEnvironmentInfo,
  sanitizePhoneNumber,
  toLocalIsoDate,
} from './utils.ts';
export { testEnvironmentConfig } from './testEnvironment.ts';
export {
  handleCourrierUploadError,
  handleCourrierLoadError,
  handleCourrierDeleteError,
  handleCourrierDownloadError,
  handleCourrierEmailError,
  handleCourrierViewError,
  logError,
  showErrorNotification,
  showErrorNotificationAsync,
} from './errorHandling.ts';
export {
  ALLOWED_COURRIER_FILE_EXTENSIONS,
  MAX_COURRIER_FILE_SIZE,
  sanitizeFileName,
  validateCourrierFile,
  validateCourrierForm,
  validateCourrierUpdateForm,
} from './courrierValidation.ts';
export type { ValidationResult } from './courrierValidation.ts';
export { handleAuthError } from './authErrorHandling.ts';
export { validatePasswordStrength } from './passwordValidation.ts';
export type { PasswordStrength } from './passwordValidation.ts';
export {
  formatFileSize,
  formatRecordingDate,
  formatRecordingDuration,
  getRecordingAgentLabel,
  getRecordingPhone,
  getRecordingProspectLabel,
  getRecordingStatusClass,
  getRecordingStatusLabel,
  RECORDING_STATUS_OPTIONS,
} from './recordings.ts';
export {
  DEFAULT_IMAGE_CROP,
  DEFAULT_IMAGE_PERCENT_CROP,
  IMAGE_ACCEPTED_TYPES,
  IMAGE_ASPECT_RATIOS,
  IMAGE_MAX_SIZE_MB,
} from './imageConverter.ts';
export type { ImageAspectRatio } from './imageConverter.ts';
export { prependSelectOption, toSelectOptions } from './utils.ts';
export {
  PLANNING_DAY_OPTIONS,
  buildPlanningDetailedEvents,
  buildPlanningMonthEvents,
  getPlanningEventStyle,
  getPlanningEndOfWeek,
  getPlanningStartOfWeek,
  toPlanningDateKey,
} from './planning.ts';
export {
  BOOKING_END_HOUR,
  BOOKING_HOUR_OPTIONS,
  BOOKING_MINUTE_OPTIONS,
  BOOKING_START_HOUR,
  BOOKING_WEEKDAYS,
  CALENDAR_MESSAGES,
  applyBookingDefaultEnd,
  buildBookingMonthFilters,
  buildBookingMonthView,
  buildBookingWeekView,
  buildCreateBookingPayload,
  buildMoveBookingPayload,
  calendarLocalizer,
  createBookingFormState,
  createBookingMoveFormState,
  formatBookingDateInput,
  getBookingDetailPresentation,
  getRoleColor,
  parseBookingDateJump,
  shiftBookingMonth,
  shiftBookingWeek,
} from './bookingUtils.ts';
export type {
  BookingDetailPresentation,
  BookingMonthDayView,
  BookingMonthView,
  BookingWeekDayView,
  BookingWeekEventView,
  BookingWeekView,
} from './bookingUtils.ts';
export {
  LEAD_QUALIFICATION_OPTIONS,
  formatLeadAgentLabel,
  formatLeadDateTime,
  formatLeadProspectAddress,
  formatLeadProspectLabel,
  getLeadQualificationButtonClass,
  getLeadStatusBadgeClass,
  resolveCallAgent,
  resolveLeadContactEmail,
  resolveLeadContactName,
  resolveLeadContactPhone,
  resolveLeadContactRole,
} from './leadClientDetails.ts';
export {
  ENRICHMENT_STATUS_LABELS,
  extractWebsiteAnalysis,
  formatEnrichmentDate,
  formatEnrichmentKeyLabel,
  formatEnrichmentSourceOrigin,
  formatEnrichmentSourceType,
  formatEnrichmentValue,
  formatSireneEmployeeRange,
  getEmailSignalStrength,
  getLegalSignalStrength,
  getPageSignalStrength,
  getPersonSignalStrength,
  getPhoneSignalStrength,
  getSignalStrengthClass,
  getSignalStrengthLabel,
  buildEnrichmentComparisonFieldViews,
  buildEnrichmentFieldViews,
  buildEnrichmentSourceViews,
} from './prospectEnrichment.ts';
export type {
  EnrichmentComparisonFieldView,
  EnrichmentFieldView,
  EnrichmentSourceView,
  SignalStrength,
  WebsiteAnalysisPayload,
  WebsiteDocumentPayload,
  WebsitePersonCandidate,
} from './prospectEnrichment.ts';
export {
  VIGIE_ACTION_LABELS,
  VIGIE_PERIOD_OPTIONS,
  VIGIE_SEGMENT_LABELS,
  VIGIE_STATUS_LABELS,
  buildVigieDateRange,
  formatVigieCurrency,
  formatVigieDate,
  formatVigieDateTime,
  formatVigieDistance,
  formatVigieNumber,
  formatVigiePercent,
  formatVigiePerThousand,
  getVigiePayloadLabel,
  getTopVigieContactHours,
} from './vigie.ts';
export type { SelectOption, VigieActionMessageTone, VigiePeriodKey } from './vigie.ts';
export {
  BILLING_FIELD_SOURCE_LABELS,
  FACTURATION_PERIOD_OPTIONS,
  buildInvoiceEmailOptions,
  campaignBillingDisplayName,
  formatBillingCurrency,
  formatBillingDate,
  formatBillingDateTime,
  formatBillingPercent,
  getBillingMonthBounds,
  isValidEmail,
  leadBillingProspectLabel,
  sanitizeBillingFileSegment,
  venteBillingDateLabel,
  venteBillingProspectLabel,
} from './facturation.ts';
export {
  PROJECT_PRIORITY_OPTIONS,
  PROJECT_STATUS_OPTIONS,
  PROJECT_TYPE_OPTIONS,
  TASK_STATUS_OPTIONS,
} from './projectForms.ts';
export { parseProduitImportCsv } from './produitImport.ts';
export {
  COURRIER_DIRECTION_OPTIONS,
  EMPTY_COURRIER_FILTERS,
  buildCourrierListParams,
  filterCourriers,
  formatCourrierDate,
  getCourrierDirectionBadgeClass,
  getNextCourrierSortState,
  hasActiveCourrierFilters,
  normalizeCourrierSearchText,
  toCourrierSelectOptions,
} from './courrierList.ts';
export type { CourrierSelectOption, CourrierSortState } from './courrierList.ts';
export {
  CAMPAGNE_PAYMENT_OPTIONS,
  INITIAL_CAMPAGNE_FORM,
  buildCampagneFormState,
  buildCampagnePayload,
  buildCampaignEmployeOptions,
  buildInvoiceRecipientForm,
  buildInvoiceRecipientPayload,
  buildTransferCampaignOptions,
  getAvailableCampaignEmployes,
  getCampaignAgentName,
  getTransferableCampaigns,
  sortCampaignAgents,
  validateCampagneForm,
  validateCampagneLogoFile,
} from './campagneForm.ts';
export type { CampagneFormState, CampagneSelectOption } from './campagneForm.ts';
export {
  EMPTY_SUPERVISION_GRAPH_STATS,
  SUPERVISION_CALL_CLASSIFICATION_COLORS,
  SUPERVISION_CALL_CLASSIFICATION_LABELS,
  SUPERVISION_DIALER_STATUS_COLORS,
  SUPERVISION_DIALER_STATUS_LABELS,
  SUPERVISION_ORIGIN_COLORS,
  SUPERVISION_ORIGIN_LABELS,
  SUPERVISION_QUEUE_STATUS_COLORS,
  SUPERVISION_QUEUE_STATUS_LABELS,
  buildActiveCampaignOptions,
  buildSupervisionAgentRows,
  buildSupervisionAmdKpis,
  buildSupervisionCallRows,
  buildSupervisionDialerSummary,
  buildSupervisionEmployeOptions,
  buildSupervisionExportData,
  buildSupervisionOriginSummary,
  buildSupervisionQueueItems,
  countAvailableSupervisionAgents,
  formatSupervisionBridgeLabel,
  getSupervisionAgentSinceSeconds,
  getSupervisionCallClassification,
  getSupervisionCallOrigin,
  getSupervisionEmployeeLabel,
  getSupervisionQueueSummary,
  getSupervisionRuntimeSummary,
  getVisibleSupervisionAgents,
} from './supervisionView.ts';
export type {
  SupervisionAmdKpi,
  SupervisionAgentRow,
  SupervisionCallRow,
  SupervisionQueueSummary,
  SupervisionRuntimeSummary,
  SupervisionSelectOption,
  SupervisionStatusSummaryItem,
  SupervisionStockLevel,
  SupervisionWhisperAvailability,
} from './supervisionView.ts';
export {
  EMPTY_COURRIER_ANALYSIS_HINTS,
  applyCourrierAnalysis,
  buildCourrierFinalFileName,
  buildCourrierUploadData,
  createInitialCourrierForm,
  getAnalyzedCourrierFileName,
  getCourrierFileBaseName,
  getCourrierFileExtension,
  getCourrierDuplicateNameError,
  getCourrierSuggestionMessage,
  isNouveauCourrierSubmitDisabled,
  resolveCourrierSelectValue,
} from './nouveauCourrier.ts';
export type { CourrierAnalysisHints } from './nouveauCourrier.ts';
export {
  buildCommandeCallRows,
  buildCommandeProductRows,
  buildPreviousCommandeRows,
  computeCommandeTotals,
  formatCommandeCurrency,
  formatCommandeDateTime,
  getCommandeAgentName,
  getCommandeBillingAddress,
  getCommandeDeliveryAddress,
  getCommandePaymentLabel,
  getCommandeProspectName,
  getCommandeStatusPresentation,
} from './commandeDetails.ts';
export {
  EMPTY_MATERIEL_FORM,
  buildMaterielEmployeOptions,
  buildMaterielForm,
  buildMaterielHistoryRows,
  buildMaterielPayload,
  buildMaterielTableRows,
  getActiveMaterielAffectation,
  getMaterielCountLabel,
} from './materielView.ts';
export type {
  MaterielEmployeOption,
  MaterielFormState,
  MaterielHistoryRow,
  MaterielModalMode,
  MaterielTableRow,
} from './materielView.ts';
export type {
  CommandeAddressView,
  CommandeCallRow,
  CommandeProductRow,
  CommandeTotals,
  PreviousCommandeRow,
} from './commandeDetails.ts';
export {
  QUALITE_PERIOD_OPTIONS,
  QUALITE_PROGPA_COLORS,
  buildQualiteCommercialOptions,
  buildQualiteDailyData,
  buildQualiteDateRange,
  buildQualiteDistributionData,
  buildQualiteMonthlyData,
  buildQualiteRankingData,
  formatQualiteDateLabel,
  formatQualiteMonthLabel,
  formatQualitePercent,
  formatQualiteProgpa,
  formatQualiteRankingTooltip,
  formatQualiteChartDateLabel,
  formatQualiteCommercialRankingTooltip,
  formatQualiteDistributionTooltip,
  formatQualiteTooltipProgpa,
  formatQualiteVolumeTooltip,
  getQualiteMonthBounds,
  getQualiteRangeLabel,
  getQualiteToday,
  toQualiteIsoDate,
} from './qualiteStats.ts';
export type { QualiteDateRange, QualitePeriodMode, QualiteSelectOption } from './qualiteStats.ts';
export {
  buildProspectCampagneOptions,
  buildProspectDetailPresentation,
  getProspectAssignedAgent,
  getProspectAttemptsBadgeClass,
  getProspectDisplayName,
  getProspectLocation,
  getProspectRelationBadgeClass,
  getProspectRelationLabel,
  getProspectPhoneTypeBadgeClass,
  getProspectQueueStatusBadgeClass,
  getProspectStatusBadgeClass,
  getProspectTypeBadgeClass,
  formatProspectDate,
  formatProspectDateTime,
  formatProspectStatusText,
  parseProspectPageJump,
  PROSPECT_DETAIL_STATUS_OPTIONS,
  PROSPECT_DETAIL_TYPE_OPTIONS,
} from './prospectsView.ts';
export type { ProspectCampagneOption, ProspectDetailPresentation } from './prospectsView.ts';
export {
  INCIDENT_TREATMENT_STATUS_OPTIONS,
  applyIncidentImpactedUsers,
  buildIncidentDeclarationPayload,
  buildIncidentListFilters,
  buildIncidentEmployeeOptions,
  buildIncidentQualificationPayload,
  buildIncidentTreatmentPayload,
  createIncidentDeclarationInitialForm,
  createIncidentListInitialFilters,
  createIncidentQualificationInitialForm,
  createIncidentTreatmentInitialForm,
  formatIncidentResolutionDuration,
  getIncidentQualificationForm,
  getIncidentTreatmentForm,
  getIncidentTimelineVisibility,
  getIncidentsToQualify,
  getOpenIncidents,
  groupIncidentComments,
  matchesIncidentStructuredComment,
  parseIncidentTags,
} from './incidents.ts';
export type {
  IncidentCommentGroups,
  IncidentDeclarationFormState,
  IncidentListDraftFilters,
  IncidentPayloadResult,
  IncidentQualificationFormState,
  IncidentSelectOption,
  IncidentTreatmentFormState,
  IncidentTreatmentStatus,
  IncidentTimelineVisibility,
} from './incidents.ts';
export {
  addConnectionListeners,
  checkForNewVersion,
  checkOnlineStatus,
  cleanupDevelopmentPWA,
  clearCache,
  getServiceWorkerVersion,
  getVersionInfo,
  initializePWA,
  isPWAInstallable,
  isPWAInstalled,
  isServiceWorkerSupported,
  registerServiceWorker,
  sendMessageToServiceWorker,
  showInstallPrompt,
  skipWaiting,
  startUpdateChecker,
  unregisterServiceWorker,
} from './serviceWorker.ts';
export { isLeadClientRendezVous, LEAD_CLIENT_RENDEZ_VOUS_MOTIF } from './leadClients.ts';
export { getEnvironment, shouldEnablePWA } from './browserDetection.ts';
export {
  handleBookingCancelError,
  handleBookingCreateError,
  handleBookingLoadError,
  handleBookingUpdateError,
  handleEmployeLoadError,
} from './bookingErrorHandling.ts';
export {
  BILLING_LABELS,
  BUDGET_LABELS,
  DEFAULT_FORM,
  ENGAGEMENT_LABELS,
  FAMILY_LABELS,
  QUOTE_TEMPLATES,
  QUOTE_CAMPAIGN_TYPE_LABELS,
  STATUS_LABELS,
  TIMELINE_LABELS,
  buildQuotePricingLines,
  filterQuoteTemplates,
  formatCurrency,
  getQuoteChecklistProgress,
  getQuoteEngagementMonths,
  getSelectedQuoteTemplates,
  getStatusTone,
  toggleQuoteTemplateId,
} from './devis.ts';
export {
  buildProduitListRows,
  buildProduitsListCampaignOptions,
  buildProduitsListPaginationPages,
} from './produitsList.ts';
export type {
  ProduitListRow,
  ProduitsListNavigationState,
  ProduitsListSelectOption,
} from './produitsList.ts';
export {
  buildProduitCampaignOptions,
  buildProduitCategoryOptions,
  buildProduitFormReturnState,
  buildProduitPanierOptions,
  buildProduitTypeOptions,
  getProduitTypePlaceholder,
} from './produitFormView.ts';
export type {
  ProduitFormReturnState,
  ProduitFormSelectOption,
  ProduitPanierOption,
} from './produitFormView.ts';
export {
  ANTL_CONFIGURATION_INITIAL_FORM,
  buildAntlConfigurationForm,
  buildAntlConfigurationPayload,
  validateAntlConfigurationFile,
} from './antlConfiguration.ts';
export type { AntlConfigurationFormState } from './antlConfiguration.ts';
export {
  buildAbsenceRequestView,
  formatAbsenceDateTime,
  formatAbsencePeriod,
  getAbsenceEmptyMessage,
  getAbsenceReturnDate,
} from './absenceManagement.ts';
export type { AbsenceRequestView } from './absenceManagement.ts';
export {
  buildPlanningSlotsByDay,
  formatEmployeeDocumentDate,
  formatFileSizeInKilobytes,
} from './employeeDetails.ts';
export type { PlanningSlotView } from './employeeDetails.ts';
export {
  buildCourrierUpdateData,
  createEmptyCourrierUpdateForm,
  isCourrierUpdateSubmitDisabled,
} from './updateCourrier.ts';
export {
  buildAvailableProjectMemberOptions,
  formatProjectDate,
  getProjectNextStatus,
  getProjectPilotId,
  getProjectStatusActionLabel,
  getProjectStatusBadgeClass,
} from './projetDetails.ts';
export {
  formatProjectListDate,
  getProjectListPriorityBadgeClass,
  getProjectListStatusBadgeClass,
  getProjectListTypeBadgeClass,
  normalizeProjectProgress,
} from './projetsList.ts';
export {
  buildPanierPayload,
  buildAvailablePanierProductOptions,
  createPanierFormState,
  filterPanierProductOption,
  formatPanierPrice,
  PANIER_ORIGIN_OPTIONS,
  sortPanierProducts,
} from './paniersList.ts';
export type { PanierProductOption } from './paniersList.ts';
export {
  EMPLOYEE_FILTER_OPTIONS,
  filterEmployees,
  getEmployeePosteBadgeClass,
} from './agentsList.ts';
export type { EmployeeFilterOption } from './agentsList.ts';
export {
  KANBAN_COLUMN_CONFIGS,
  getAdjacentKanbanStatus,
  getKanbanPriorityBadgeClass,
  getMyTaskPriorityBadgeClass,
  getMyTaskProjectBadgeClass,
  sortKanbanTasks,
} from './tachesKanban.ts';
export type { KanbanColumnConfig } from './tachesKanban.ts';
export { PROSPECT_IMPORT_PREVIEW_LIMIT, parseProspectCsv } from './prospectImport.ts';
export {
  addAlerteRecipient,
  formatAlerteHistoryDate,
  formatAlerteHistoryValue,
  getAlerteThreshold,
  getAlerteTypeMetadata,
  removeAlerteRecipient,
  toAlerteUpdatePayload,
  updateAlerteRecipient,
  updateAlerteThreshold,
} from './alertesView.ts';
export {
  formatProspectSignalDate,
  parseCampaignRouteId,
  PROSPECT_FALLBACK_AREA_OPTIONS,
  PROSPECT_RELATION_OPTIONS,
  PROSPECT_SIGNALEMENT_TYPE_OPTIONS,
  PROSPECT_SOURCE_OPTIONS,
  PROSPECT_TYPE_OPTIONS,
} from './prospectOperations.ts';
export type { ProspectSelectOption } from './prospectOperations.ts';
export { buildHeaderMobileNavigation, buildSubNavigation, shouldRenderSubNavigation } from './navigationView.ts';
export type { NavigationGroup, NavigationIconKey, NavigationItem } from './navigationView.ts';
export { createEmailComposerForm, getEmailComposerCopy, getEmailDefaultSubject, getEmailSendErrorMessage, validateEmailComposer } from './emailComposer.ts';
export type { ProjectMemberOption } from './projetDetails.ts';
