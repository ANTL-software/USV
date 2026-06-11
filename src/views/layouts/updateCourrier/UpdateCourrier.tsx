// styles
import "./updateCourrier.scss";

// hooks | libraries
import { ReactElement, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Select from "react-select";
import { MdArrowBack, MdSave, MdCancel } from "react-icons/md";
import { FiMail, FiUser, FiCalendar, FiFileText, FiTag, FiEye, FiFile } from "react-icons/fi";

// hooks
import { useCourrier } from "../../../hooks/useCourrier.ts";

// components
import WithAuth from "../../../utils/middleware/WithAuth.tsx";
import Header from "../../../components/header/Header.tsx";
import SubNav from "../../../components/subNav/SubNav.tsx";
import Button from "../../../components/button/Button.tsx";
import CreatableSelectComponent from "../../../components/creatableSelect/CreatableSelect.tsx";
import Loader from "../../../components/loader/Loader.tsx";
import ModernPDFViewer from "../../../components/pdfViewer/ModernPDFViewer.tsx";

// types
import { ICourrierFormData } from "../../../utils/types/courrier.types.ts";

// utils
import {
  handleCourrierUploadError,
  logError,
} from "../../../utils/scripts/errorHandling.ts";
import { validateCourrierUpdateForm } from "../../../utils/scripts/courrierValidation.ts";
import { useCourrierFieldOptions } from "../../../utils/hooks/useCourrierFieldOptions.ts";
import { useCourrierEditPreview } from "../../../utils/hooks/useCourrierEditPreview.ts";
import { DIRECTION_OPTIONS, PRIORITY_OPTIONS } from "../../../utils/constants/courrierOptions.ts";

// Alert service
import { showError, showSuccess } from "../../../utils/services/alertService";

function UpdateCourrier(): ReactElement {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { updateCourrier, isLoading } = useCourrier();

  const { courrier, formDefaults, pdfUrl, fileType, loadingCourrier } =
    useCourrierEditPreview(id);

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
    customFileName: "",
  });

  // Peupler le formulaire dès que le courrier est chargé
  useEffect(() => {
    if (formDefaults) setFormData(formDefaults);
  }, [formDefaults]);

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

  const handleSelectChange = (selectedOption: { value: string; label: string } | null, name: string) => {
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
        customFileName: formData.customFileName?.trim() || undefined,
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
                          value={DIRECTION_OPTIONS.find(
                            (option) => option.value === formData.direction
                          )}
                          onChange={(selectedOption) =>
                            handleSelectChange(selectedOption, "direction")
                          }
                          options={DIRECTION_OPTIONS}
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
                        <label htmlFor="customFileName">
                          <FiFile />
                          Nom du fichier *
                        </label>
                        <input
                          type="text"
                          id="customFileName"
                          name="customFileName"
                          value={formData.customFileName}
                          onChange={handleInputChange}
                          onBlur={handleInputBlur}
                          placeholder="Nom du document (sans extension)"
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
                          value={PRIORITY_OPTIONS.find(
                            (option) => option.value === formData.priority
                          )}
                          onChange={(selectedOption) =>
                            handleSelectChange(selectedOption, "priority")
                          }
                          options={PRIORITY_OPTIONS}
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
    </>
  );
}

const UpdateCourrierWithAuth = WithAuth(UpdateCourrier);
export default UpdateCourrierWithAuth;