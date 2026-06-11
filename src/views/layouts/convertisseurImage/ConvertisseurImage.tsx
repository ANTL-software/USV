// styles
import "./convertisseurImage.scss";
import "react-image-crop/dist/ReactCrop.css";

// hooks | libraries
import { ReactElement, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import ReactCrop, { type Crop, type PercentCrop } from "react-image-crop";
import {
  MdArrowBack,
  MdPhotoCamera,
  MdCrop,
  MdDownload,
  MdCheckCircle,
  MdWarning,
  MdRefresh,
} from "react-icons/md";
import { FiUpload, FiFileText } from "react-icons/fi";

// components
import WithAuth from "../../../utils/middleware/WithAuth.tsx";
import Header from "../../../components/header/Header.tsx";
import SubNav from "../../../components/subNav/SubNav.tsx";
import Button from "../../../components/button/Button.tsx";

// services
import { convertImageToPdfService, IConvertCropData } from "../../../API/services/courrier.service.ts";
import { triggerBlobDownload } from "../../../utils/services/downloadService.ts";

// utils
import { logError } from "../../../utils/scripts/errorHandling.ts";
import { showError } from "../../../utils/services/alertService.ts";

type AspectRatio = "libre" | "carre" | "4-3" | "a4";

const ASPECT_RATIOS: Record<AspectRatio, number | undefined> = {
  libre: undefined,
  carre: 1,
  "4-3": 4 / 3,
  a4: 210 / 297,
};

const ACCEPTED_TYPES = ".jpg,.jpeg,.png,.webp,.heic,.heif";
const MAX_SIZE_MB = 100;

function ConvertisseurImage(): ReactElement {
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>("");
  const [imageLoadFailed, setImageLoadFailed] = useState<boolean>(false);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [customFileName, setCustomFileName] = useState<string>("");

  const defaultCrop: Crop = { unit: "%", x: 5, y: 5, width: 90, height: 90 };
  const [crop, setCrop] = useState<Crop>(defaultCrop);
  const [completedCrop, setCompletedCrop] = useState<PercentCrop>({
    unit: "%", x: 5, y: 5, width: 90, height: 90,
  });
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("libre");

  useEffect(() => {
    return () => {
      if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    };
  }, [imagePreviewUrl]);

  const handleImageSelected = useCallback((file: File) => {
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      showError(`L'image est trop lourde (max ${MAX_SIZE_MB}MB)`);
      return;
    }

    if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);

    const url = URL.createObjectURL(file);
    const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "").trim();

    setImageFile(file);
    setImagePreviewUrl(url);
    setImageLoadFailed(false);
    setCrop(defaultCrop);
    setCompletedCrop({ unit: "%", x: 5, y: 5, width: 90, height: 90 });
    setCustomFileName(nameWithoutExt);
    setStep(2);
  }, [imagePreviewUrl]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) handleImageSelected(e.dataTransfer.files[0]);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) handleImageSelected(e.target.files[0]);
    e.target.value = "";
  };

  const handleImageLoadError = () => {
    setImageLoadFailed(true);
    setCompletedCrop({ unit: "%", x: 0, y: 0, width: 100, height: 100 });
  };

  const handleAspectChange = (ratio: AspectRatio) => {
    setAspectRatio(ratio);
    setCrop(prev => ({ ...prev, aspect: ASPECT_RATIOS[ratio] }));
  };

  const handleCropChange = (_: unknown, percentCrop: PercentCrop) => {
    setCrop(percentCrop);
  };

  const handleCropComplete = (_: unknown, percentCrop: PercentCrop) => {
    if (percentCrop.width > 0 && percentCrop.height > 0) {
      setCompletedCrop(percentCrop);
    }
  };

  const handleConvert = async () => {
    if (!imageFile || !customFileName.trim()) return;

    setIsConverting(true);
    try {
      const cropData: IConvertCropData = {
        x: completedCrop.x,
        y: completedCrop.y,
        width: completedCrop.width || 100,
        height: completedCrop.height || 100,
      };

      const blob = await convertImageToPdfService(imageFile, cropData, customFileName.trim());
      triggerBlobDownload(blob, `${customFileName.trim()}.pdf`);
      setStep(4);
    } catch (error: unknown) {
      logError("convertImageToPdf", error);
      showError("Erreur lors de la conversion. Veuillez réessayer.");
    } finally {
      setIsConverting(false);
    }
  };

  const handleReset = () => {
    if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    setImageFile(null);
    setImagePreviewUrl("");
    setImageLoadFailed(false);
    setCustomFileName("");
    setCrop(defaultCrop);
    setCompletedCrop({ unit: "%", x: 5, y: 5, width: 90, height: 90 });
    setAspectRatio("libre");
    setStep(1);
  };

  return (
    <>
      <Header />
      <SubNav />
      <main id="convertisseurImage">
        <div className="converterContainer">
          {/* Header */}
          <header className="converterHeader" data-aos="fade-down">
            <Button style="back" onClick={() => navigate("/mail")} type="button">
              <MdArrowBack />
              <span>Retour</span>
            </Button>
            <div className="headerTitle">
              <MdPhotoCamera />
              <h1>Photo → PDF</h1>
            </div>
          </header>

          {/* Stepper — visible étapes 1 à 3 */}
          {step !== 4 && (
            <div className="stepper" data-aos="fade-up" data-aos-delay="50">
              {([
                { num: 1, label: "Upload", icon: <FiUpload /> },
                { num: 2, label: "Recadrage", icon: <MdCrop /> },
                { num: 3, label: "Convertir", icon: <FiFileText /> },
              ] as { num: 1 | 2 | 3; label: string; icon: ReactElement }[]).map(({ num, label, icon }) => (
                <div
                  key={num}
                  className={`stepItem ${step === num ? "active" : ""} ${step > num ? "done" : ""}`}
                >
                  <div className="stepCircle">
                    {step > num ? <MdCheckCircle /> : icon}
                  </div>
                  <span className="stepLabel">{label}</span>
                </div>
              ))}
            </div>
          )}

          {/* ── Étape 1 : Upload ── */}
          {step === 1 && (
            <section className="stepSection" data-aos="fade-up" data-aos-delay="100">
              <div
                className={`uploadZone ${dragActive ? "dragActive" : ""}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => document.getElementById("img-input")?.click()}
              >
                <input
                  type="file"
                  id="img-input"
                  accept={ACCEPTED_TYPES}
                  onChange={handleFileInput}
                  hidden
                />
                <MdPhotoCamera className="uploadIcon" />
                <div className="uploadText">
                  <span className="primaryText">Cliquez ou glissez votre photo ici</span>
                  <span className="secondaryText">
                    JPEG · PNG · WEBP · HEIC — max {MAX_SIZE_MB}MB
                  </span>
                </div>
              </div>
            </section>
          )}

          {/* ── Étape 2 : Recadrage ── */}
          {step === 2 && (
            <section className="stepSection cropSection" data-aos="fade-up" data-aos-delay="100">
              {imageLoadFailed ? (
                <div className="heicNotice">
                  <MdWarning className="warningIcon" />
                  <p>L'aperçu n'est pas disponible pour ce format dans votre navigateur.</p>
                  <p>L'image sera convertie intégralement sans recadrage.</p>
                </div>
              ) : (
                <>
                  <div className="aspectButtons">
                    {(["libre", "carre", "4-3", "a4"] as AspectRatio[]).map(r => (
                      <button
                        key={r}
                        type="button"
                        className={`aspectBtn ${aspectRatio === r ? "active" : ""}`}
                        onClick={() => handleAspectChange(r)}
                      >
                        {r === "libre" && "Libre"}
                        {r === "carre" && "Carré"}
                        {r === "4-3" && "4:3"}
                        {r === "a4" && "A4"}
                      </button>
                    ))}
                  </div>

                  <div className="cropWrapper">
                    <ReactCrop
                      crop={crop}
                      onChange={handleCropChange}
                      onComplete={handleCropComplete}
                      aspect={ASPECT_RATIOS[aspectRatio]}
                      minWidth={5}
                      minHeight={5}
                    >
                      <img
                        src={imagePreviewUrl}
                        alt="Image à recadrer"
                        onError={handleImageLoadError}
                        style={{ maxWidth: "100%", maxHeight: "60dvh", display: "block" }}
                      />
                    </ReactCrop>
                  </div>
                </>
              )}

              <div className="stepActions">
                <button type="button" className="btnSecondary" onClick={() => setStep(1)}>
                  <MdArrowBack /> Changer l'image
                </button>
                <button type="button" className="btnPrimary" onClick={() => setStep(3)}>
                  Suivant <MdCheckCircle />
                </button>
              </div>
            </section>
          )}

          {/* ── Étape 3 : Nom + conversion ── */}
          {step === 3 && (
            <section className="stepSection convertSection" data-aos="fade-up" data-aos-delay="100">
              <div className="convertContent">
                <FiFileText className="convertIcon" />
                <h2>Nommer votre PDF</h2>
                <p className="convertHint">
                  Le fichier sera téléchargé directement sur votre appareil.<br />
                  Rien ne sera conservé sur le serveur.
                </p>

                <div className="fileNameGroup">
                  <label htmlFor="customFileName">Nom du fichier</label>
                  <div className="fileNameInput">
                    <input
                      type="text"
                      id="customFileName"
                      value={customFileName}
                      onChange={e => setCustomFileName(e.target.value)}
                      onBlur={e => setCustomFileName(e.target.value.trim())}
                      placeholder="Nom du document"
                      autoFocus
                    />
                    <span className="extension">.pdf</span>
                  </div>
                </div>
              </div>

              <div className="stepActions">
                <button type="button" className="btnSecondary" onClick={() => setStep(2)} disabled={isConverting}>
                  <MdArrowBack /> Recadrage
                </button>
                <button
                  type="button"
                  className="btnPrimary"
                  onClick={handleConvert}
                  disabled={isConverting || !customFileName.trim()}
                >
                  <MdDownload />
                  {isConverting ? "Conversion en cours..." : "Convertir et télécharger"}
                </button>
              </div>
            </section>
          )}

          {/* ── Étape 4 : Succès ── */}
          {step === 4 && (
            <section className="stepSection successSection" data-aos="fade-up">
              <div className="successContent">
                <MdCheckCircle className="successIcon" />
                <h2>PDF téléchargé !</h2>
                <p>
                  <strong>{customFileName}.pdf</strong> a été converti et téléchargé avec succès.<br />
                  Rien n'a été conservé sur le serveur.
                </p>
                <div className="successActions">
                  <button type="button" className="btnSecondary" onClick={handleReset}>
                    <MdRefresh /> Convertir une autre image
                  </button>
                  <button type="button" className="btnPrimary" onClick={() => navigate("/mail")}>
                    Retour à l'accueil
                  </button>
                </div>
              </div>
            </section>
          )}
        </div>
      </main>
    </>
  );
}

const ConvertisseurImageWithAuth = WithAuth(ConvertisseurImage);
export default ConvertisseurImageWithAuth;
