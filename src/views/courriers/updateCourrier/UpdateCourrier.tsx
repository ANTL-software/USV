// styles
import "./updateCourrier.scss";

// hooks | libraries
import { ReactElement, useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Select from "react-select";
import { MdArrowBack, MdSave, MdCancel } from "react-icons/md";
import { FiMail, FiUser, FiCalendar, FiFileText, FiTag, FiEye } from "react-icons/fi";

// context
import { CourrierContext } from "../../../context/courrier/CourrierContext.tsx";

// components
import WithAuth from "../../../utils/middleware/WithAuth.tsx";
import Header from "../../../components/header/Header.tsx";
import SubNav from "../../../components/subNav/SubNav.tsx";
import BackToTop from "../../../components/backToTop/BackToTop.tsx";
import Button from "../../../components/button/Button.tsx";
import CreatableSelectComponent from "../../../components/creatableSelect/CreatableSelect.tsx";
import Loader from "../../../components/loader/Loader.tsx";
import ModernPDFViewer from "../../../components/pdfViewer/ModernPDFViewer.tsx";

// types
import { ICourrierFormData, ICourrier } from "../../../utils/types/courrier.types.ts";

// utils
import { 
  handleCourrierUploadError, 
  handleCourrierLoadError, 
  logError, 
  showErrorNotification 
} from "../../../utils/scripts/errorHandling.ts";
import { validateCourrierUpdateForm } from "../../../utils/scripts/courrierValidation.ts";
import { useCourrierFieldOptions } from "../../../utils/hooks/useCourrierFieldOptions.ts";

// services
import { downloadCourrierService, getCourrierByIdService } from "../../../API/services/courrier.service.ts";
import { generateViewUrlService } from "../../../API/services/viewUrl.service.ts";

// Alert service
import { showError, showSuccess } from "../../../utils/services/alertService";

interface SelectOption {
  value: string;
  label: string;
}

function UpdateCourrier(): ReactElement {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { updateCourrier, isLoading } = useContext(CourrierContext);
  
  const [courrier, setCourrier] = useState<ICourrier | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const [fileType, setFileType] = useState<'pdf' | 'image'>('pdf');
  const [loadingCourrier, setLoadingCourrier] = useState<boolean>(true);
  
  // Charger les options pour les champs avec autocomplétion
  const kindOptions = useCourrierFieldOptions('kind');
  const departmentOptions = useCourrierFieldOptions('department');
  const emitterOptions = useCourrierFieldOptions('emitter');
  const recipientOptions = useCourrierFieldOptions('recipient');
  
  const [formData, setFormData] = useState<ICourrierFormData>({
    direction: "entrant",
    emitter: "",
    recipient: "",
    receptionDate: "",
    courrierDate: "",
    priority: "normal",
    department: "",
    kind: "",
    description: "",
    customFileName: ""
  });

  const directionOptions: SelectOption[] = [
    { value: 'entrant', label: 'Entrant' },
    { value: 'sortant', label: 'Sortant' },
    { value: 'interne', label: 'Interne' }
  ];

  const priorityOptions: SelectOption[] = [
    { value: 'low', label: 'Basse' },
    { value: 'normal', label: 'Normale' },
    { value: 'high', label: 'Haute' },
    { value: 'urgent', label: 'Urgente' }
  ];

  useEffect(() => {
    const fetchCourrier = async () => {
      if (!id) return;
      
      try {
        setLoadingCourrier(true);
        
        // Fetch courrier data using the service
        const courrierData: ICourrier = await getCourrierByIdService(parseInt(id));
        setCourrier(courrierData);
        
        // Populate form with existing data
        setFormData({
          direction: courrierData.direction,
          emitter: courrierData.emitter || "",
          recipient: courrierData.recipient || "",
          receptionDate: courrierData.receptionDate ? courrierData.receptionDate.split('T')[0] : "",
          courrierDate: courrierData.courrierDate ? courrierData.courrierDate.split('T')[0] : "",
          priority: courrierData.priority || "normal",
          department: courrierData.department || "",
          kind: courrierData.kind || "",
          description: courrierData.description || "",
          customFileName: courrierData.fileName.replace(/\.[^/.]+$/, "") || ""
        });

        // Load file for preview
        // Détecter le type de fichier basé sur l'extension
        const isImage = courrierData.fileName.toLowerCase().match(/\.(jpg|jpeg|png|gif|bmp|webp)$/);
        
        if (isImage) {
          // Pour les images, utiliser l'endpoint download direct (pas de problème CSP avec <img>)
          const blob = await downloadCourrierService(courrierData.id);
          const url = URL.createObjectURL(blob);
          setPdfUrl(url);
          setFileType('image');
        } else {
          // Pour les PDFs, utiliser l'URL signée pour éviter les problèmes d'authentification iframe
          const viewUrlData = await generateViewUrlService(courrierData.id, 10);
          setPdfUrl(viewUrlData.viewUrl);
          setFileType('pdf');
        }
        
      } catch (error: unknown) {
        logError('loadCourrierForEdit', error);
        const errorMessage = handleCourrierLoadError(error);
        showErrorNotification(errorMessage);
        navigate("/mail/list");
      } finally {
        setLoadingCourrier(false);
      }
    };

    fetchCourrier();

    // Cleanup pour les blob URLs (images uniquement)
    return () => {
      if (pdfUrl && pdfUrl.startsWith('blob:')) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [id, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value.trim()
    }));
  };

  const handleSelectChange = (selectedOption: SelectOption | null, name: string) => {
    if (selectedOption) {
      setFormData(prev => ({
        ...prev,
        [name]: selectedOption.value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!courrier) return;

    // Validation
    const validation = validateCourrierUpdateForm(formData);
    if (!validation.isValid) {
      await showError(validation.errorMessage, 'Erreur de validation');
      return;
    }
    
    try {
      const updateData = {
        direction: formData.direction,
        emitter: formData.emitter?.trim() || undefined,
        recipient: formData.recipient?.trim() || undefined,
        receptionDate: formData.receptionDate || undefined,
        courrierDate: formData.courrierDate || undefined,
        priority: formData.priority,
        department: formData.department?.trim() || undefined,
        kind: formData.kind?.trim() || undefined,
        description: formData.description?.trim() || undefined,
      };

      await updateCourrier(courrier.id, updateData);
      await showSuccess('Courrier modifié avec succès');
      navigate("/mail/list");
    } catch (error: unknown) {
      logError('handleSubmit - updateCourrier', error);
      const errorMessage = handleCourrierUploadError(error);
      await showError(errorMessage, 'Erreur de modification');
    }
  };

  const handleCancel = () => {
    navigate("/mail/list");
  };

  if (loadingCourrier) {
    return (
      <>
        <Header />
        <SubNav />
        <main id="updateCourrier" className="updateCourrierMain">
          <div className="updateCourrierContainer">
            <div className="loadingState">
              <Loader size="large" message="Chargement du courrier..." />
            </div>
          </div>
        </main>
      </>
    );
  }

  if (!courrier) {
    return (
      <>
        <Header />
        <SubNav />
        <main id="updateCourrier" className="updateCourrierMain">
          <div className="updateCourrierContainer">
            <div className="errorState">
              <p>Courrier non trouvé</p>
              <Button style="green" onClick={() => navigate("/mail/list")}>
                Retour à la liste
              </Button>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <SubNav />
      <main id="updateCourrier" className="updateCourrierMain">
        <div className="updateCourrierContainer">
          {/* Header */}
          <header className="updateCourrierHeader" data-aos="fade-down">
            <Button style="back" onClick={handleCancel} type="button">
              <MdArrowBack />
              <span>Retour</span>
            </Button>
            <h1 className="pageTitle">Modifier le courrier</h1>
          </header>

          <div className="updateCourrierContent" data-aos="fade-up" data-aos-delay="100">
            {/* Form Section */}
            <section className="formSection">
              <form className="courrierForm" onSubmit={handleSubmit}>
                <div className="formGrid">
                  {/* Informations principales */}
                  <div className="formSection">
                    <h3 className="sectionTitle">
                      <FiMail />
                      Informations principales
                    </h3>

                    <div className="formRow">
                      <div className="formGroup">
                        <label htmlFor="direction">Direction *</label>
                        <Select
                          inputId="direction"
                          value={directionOptions.find(
                            (option) => option.value === formData.direction
                          )}
                          onChange={(selectedOption) =>
                            handleSelectChange(selectedOption, "direction")
                          }
                          options={directionOptions}
                          className="react-select-container"
                          classNamePrefix="react-select"
                          placeholder="Sélectionner..."
                          isSearchable={false}
                        />
                      </div>
                      <div className="formGroup">
                        <label htmlFor="kind">Type de courrier *</label>
                        <CreatableSelectComponent
                          id="kind"
                          name="kind"
                          value={formData.kind}
                          onChange={(value) =>
                            setFormData((prev) => ({ ...prev, kind: value }))
                          }
                          options={kindOptions.options}
                          placeholder="Sélectionner ou créer un type de courrier..."
                          isLoading={kindOptions.isLoading}
                        />
                      </div>
                    </div>

                    <div className="formRow">
                      <div className="formGroup">
                        <label htmlFor="emitter">
                          <FiUser />
                          Expéditeur
                        </label>
                        <CreatableSelectComponent
                          id="emitter"
                          name="emitter"
                          value={formData.emitter}
                          onChange={(value) =>
                            setFormData((prev) => ({ ...prev, emitter: value }))
                          }
                          options={emitterOptions.options}
                          placeholder="Sélectionner ou créer un expéditeur..."
                          isLoading={emitterOptions.isLoading}
                        />
                      </div>
                      <div className="formGroup">
                        <label htmlFor="recipient">
                          <FiUser />
                          Destinataire
                        </label>
                        <CreatableSelectComponent
                          id="recipient"
                          name="recipient"
                          value={formData.recipient}
                          onChange={(value) =>
                            setFormData((prev) => ({ ...prev, recipient: value }))
                          }
                          options={recipientOptions.options}
                          placeholder="Sélectionner ou créer un destinataire..."
                          isLoading={recipientOptions.isLoading}
                        />
                      </div>
                    </div>

                    <div className="formRow">
                      <div className="formGroup">
                        <label htmlFor="department">
                          <FiTag />
                          Service/Département *
                        </label>
                        <CreatableSelectComponent
                          id="department"
                          name="department"
                          value={formData.department}
                          onChange={(value) =>
                            setFormData((prev) => ({ ...prev, department: value }))
                          }
                          options={departmentOptions.options}
                          placeholder="Sélectionner ou créer un service/département..."
                          isLoading={departmentOptions.isLoading}
                        />
                      </div>
                      <div className="formGroup">
                        <label htmlFor="priority">
                          <FiTag />
                          Priorité
                        </label>
                        <Select
                          inputId="priority"
                          value={priorityOptions.find(
                            (option) => option.value === formData.priority
                          )}
                          onChange={(selectedOption) =>
                            handleSelectChange(selectedOption, "priority")
                          }
                          options={priorityOptions}
                          className="react-select-container"
                          classNamePrefix="react-select"
                          placeholder="Sélectionner..."
                          isSearchable={false}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="formSection">
                    <h3 className="sectionTitle">
                      <FiCalendar />
                      Dates
                    </h3>

                    <div className="formRow">
                      <div className="formGroup">
                        <label htmlFor="receptionDate">Date de réception</label>
                        <input
                          type="date"
                          id="receptionDate"
                          name="receptionDate"
                          value={formData.receptionDate}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="formGroup">
                        <label htmlFor="courrierDate">Date du courrier</label>
                        <input
                          type="date"
                          id="courrierDate"
                          name="courrierDate"
                          value={formData.courrierDate}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="formSection fullWidth">
                    <h3 className="sectionTitle">
                      <FiFileText />
                      Description
                    </h3>

                    <div className="formGroup">
                      <label htmlFor="description">Notes et observations</label>
                      <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        onBlur={handleInputBlur}
                        placeholder="Décrivez le contenu du courrier, les actions à prendre..."
                        rows={4}
                      />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="formActions">
                  <button
                    type="button"
                    className="btnCancel"
                    onClick={handleCancel}
                    disabled={isLoading}
                  >
                    <MdCancel />
                    Annuler
                  </button>

                  <button
                    type="submit"
                    className="btnSubmit"
                    disabled={
                      isLoading ||
                      !formData.direction ||
                      !formData.kind.trim() ||
                      !formData.department.trim()
                    }
                  >
                    <MdSave />
                    {isLoading ? "Modification..." : "Modifier"}
                  </button>
                </div>
              </form>
            </section>

            {/* Preview Section */}
            <aside className="previewSection">
              <div className="previewHeader">
                <FiEye />
                <h2>Aperçu du document</h2>
              </div>
              <div className="previewContainer">
                {pdfUrl && (
                  fileType === 'image' ? (
                    <img
                      src={pdfUrl}
                      alt={courrier?.fileName || "Aperçu du courrier"}
                      className="imagePreview"
                    />
                  ) : (
                    <ModernPDFViewer 
                      pdfUrl={pdfUrl}
                      fileName={courrier?.fileName || 'document.pdf'}
                    />
                  )
                )}
              </div>
            </aside>
          </div>
        </div>
      </main>
      <BackToTop />
    </>
  );
}

const UpdateCourrierWithAuth = WithAuth(UpdateCourrier);
export default UpdateCourrierWithAuth;