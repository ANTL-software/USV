// styles
import "./nouveauCourrier.scss";

// hooks | libraries
import { ReactElement, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import { MdArrowBack, MdUploadFile, MdSave, MdCancel } from "react-icons/md";
import { FiMail, FiUser, FiCalendar, FiFileText, FiTag } from "react-icons/fi";

// context
import { CourrierContext } from "../../../context/courrier/CourrierContext.tsx";

// components
import WithAuth from "../../../utils/middleware/WithAuth.tsx";
import Header from "../../../components/header/Header.tsx";
import SubNav from "../../../components/subNav/SubNav.tsx";
import BackToTop from "../../../components/backToTop/BackToTop.tsx";
import Button from "../../../components/button/Button.tsx";
import CreatableSelectComponent from "../../../components/creatableSelect/CreatableSelect.tsx";

// types
import { ICourrierFormData } from "../../../utils/types/courrier.types.ts";

// utils
import { handleCourrierUploadError, logError, showErrorNotification } from "../../../utils/scripts/errorHandling.ts";
import { validateCourrierForm } from "../../../utils/scripts/courrierValidation.ts";
import { useCourrierFieldOptions } from "../../../utils/hooks/useCourrierFieldOptions.ts";

interface SelectOption {
  value: string;
  label: string;
}

function NouveauCourrier(): ReactElement {
  const navigate = useNavigate();
  const { uploadCourrier, isLoading } = useContext(CourrierContext);
  
  // Charger les options pour les champs avec autocomplétion
  const kindOptions = useCourrierFieldOptions('kind');
  const departmentOptions = useCourrierFieldOptions('department');
  const emitterOptions = useCourrierFieldOptions('emitter');
  const recipientOptions = useCourrierFieldOptions('recipient');
  
  const [formData, setFormData] = useState<ICourrierFormData>({
    direction: "entrant",
    emitter: "",
    recipient: "",
    receptionDate: new Date().toISOString().split('T')[0],
    courrierDate: "",
    priority: "normal",
    department: "",
    kind: "",
    description: "",
    customFileName: ""
  });
  const [dragActive, setDragActive] = useState(false);

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
      [name]: value.trim() // Trim quand l'utilisateur sort du champ
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

  const handleFileUpload = (file: File) => {
    const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "").trim();
    
    setFormData(prev => ({
      ...prev,
      fichierJoint: file,
      customFileName: prev.customFileName || nameWithoutExt // Ne remplace que si vide
    }));
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const validation = validateCourrierForm(formData);
    if (!validation.isValid) {
      showErrorNotification(validation.errorMessage, 'warning');
      return;
    }
    
    try {
      const uploadData = {
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

      await uploadCourrier(formData.fichierJoint!, uploadData);
      showErrorNotification('Courrier créé avec succès', 'info');
      navigate("/utils/mail");
    } catch (error: unknown) {
      logError('handleSubmit - uploadCourrier', error);
      const errorMessage = handleCourrierUploadError(error);
      showErrorNotification(errorMessage);
    }
  };

  const handleCancel = () => {
    navigate("/mail");
  };

  return (
    <>
      <Header />
      <SubNav />
      <main id="nouveauCourrier" className="nouveauCourrierMain">
        <div className="nouveauCourrierContainer">
          {/* Header */}
          <header className="nouveauCourrierHeader" data-aos="fade-down">
            <Button style="back" onClick={handleCancel} type="button">
              <MdArrowBack />
              <span>Retour</span>
            </Button>
            <h1 className="pageTitle">Nouveau courrier</h1>
          </header>

          {/* Form */}
          <form
            className="courrierForm"
            onSubmit={handleSubmit}
            data-aos="fade-up"
            data-aos-delay="100"
          >
            <div className="formGrid">
              {/* Informations principales */}
              <section className="formSection">
                <h2 className="sectionTitle">
                  <FiMail />
                  Informations principales
                </h2>

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
                    <label htmlFor="customFileName">
                      <MdUploadFile />
                      Nom du fichier *
                    </label>
                    <input
                      type="text"
                      id="customFileName"
                      name="customFileName"
                      value={formData.customFileName}
                      onChange={handleInputChange}
                      onBlur={handleInputBlur}
                      placeholder="Nom personnalisé du fichier (sans extension)"
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
              </section>

              {/* Dates */}
              <section className="formSection">
                <h2 className="sectionTitle">
                  <FiCalendar />
                  Dates
                </h2>

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
              </section>

              {/* Description */}
              <section className="formSection fullWidth">
                <h2 className="sectionTitle">
                  <FiFileText />
                  Description
                </h2>

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
              </section>

              {/* Upload de fichier */}
              <section className="formSection fullWidth">
                <h2 className="sectionTitle">
                  <MdUploadFile />
                  Document joint
                </h2>

                <div
                  className={`uploadZone ${dragActive ? "dragActive" : ""} ${
                    formData.fichierJoint ? "hasFile" : ""
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById("file-input")?.click()}
                >
                  <input
                    type="file"
                    id="file-input"
                    onChange={handleFileInput}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    hidden
                  />

                  {formData.fichierJoint ? (
                    <div className="fileInfo">
                      <MdUploadFile className="fileIcon" />
                      <div className="fileDetails">
                        <span className="fileName">
                          {formData.fichierJoint.name}
                        </span>
                        <span className="fileSize">
                          {(formData.fichierJoint.size / 1024 / 1024).toFixed(
                            2
                          )}{" "}
                          MB
                        </span>
                      </div>
                      <button
                        type="button"
                        className="removeFile"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFormData((prev) => ({
                            ...prev,
                            fichierJoint: undefined,
                          }));
                        }}
                      >
                        <MdCancel />
                      </button>
                    </div>
                  ) : (
                    <div className="uploadPrompt">
                      <MdUploadFile className="uploadIcon" />
                      <div className="uploadText">
                        <span className="primaryText">
                          Cliquez pour sélectionner
                        </span>
                        <span className="secondaryText">
                          ou glissez-déposez votre fichier ici
                        </span>
                        <span className="formatText">
                          PDF, DOC, DOCX, JPG, PNG (max 10MB)
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </section>
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
                  !formData.fichierJoint ||
                  !formData.customFileName.trim() ||
                  !formData.kind.trim() ||
                  !formData.department.trim()
                }
              >
                <MdSave />
                {isLoading ? "Enregistrement..." : "Enregistrer"}
              </button>
            </div>
          </form>
        </div>
      </main>
      <BackToTop />
    </>
  );
}

const NouveauCourrierWithAuth = WithAuth(NouveauCourrier);
export default NouveauCourrierWithAuth;