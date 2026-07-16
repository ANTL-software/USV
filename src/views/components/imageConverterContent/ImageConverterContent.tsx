import "react-image-crop/dist/ReactCrop.css";

import type { ReactElement } from "react";
import ReactCrop from "react-image-crop";
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

import type { ImageConverterPageViewModel } from "../../../hooks/index.ts";
import { Button, Header, SubNav } from "../index.ts";
import {
  IMAGE_ACCEPTED_TYPES,
  IMAGE_ASPECT_RATIOS,
  IMAGE_MAX_SIZE_MB,
} from "../../../utils/scripts/index.ts";
import type { ImageAspectRatio } from "../../../utils/scripts/index.ts";

interface ImageConverterContentProps { viewModel: ImageConverterPageViewModel; }

export function ImageConverterContent({ viewModel }: ImageConverterContentProps): ReactElement {
  const {
    aspectRatio,
    changeAspectRatio,
    convert,
    crop,
    customFileName,
    dragActive,
    handleCropChange,
    handleCropComplete,
    handleDrag,
    handleDrop,
    handleFileInput,
    imageLoadFailed,
    imagePreviewUrl,
    isConverting,
    markImageLoadFailed,
    navigateBack,
    reset,
    setCustomFileName,
    setStep,
    step,
  } = viewModel;

  return (
    <>
      <Header />
      <SubNav />
      <main id="convertisseurImage">
        <div className="converterContainer">
          {/* Header */}
          <header className="converterHeader" data-aos="fade-down">
            <Button style="back" onClick={navigateBack} type="button">
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
                  accept={IMAGE_ACCEPTED_TYPES}
                  onChange={handleFileInput}
                  hidden
                />
                <MdPhotoCamera className="uploadIcon" />
                <div className="uploadText">
                  <span className="primaryText">Cliquez ou glissez votre photo ici</span>
                  <span className="secondaryText">
                    JPEG · PNG · WEBP · HEIC — max {IMAGE_MAX_SIZE_MB}MB
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
                    {(["libre", "carre", "4-3", "a4"] as ImageAspectRatio[]).map(r => (
                      <button
                        key={r}
                        type="button"
                        className={`aspectBtn ${aspectRatio === r ? "active" : ""}`}
                        onClick={() => changeAspectRatio(r)}
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
                      aspect={IMAGE_ASPECT_RATIOS[aspectRatio]}
                      minWidth={5}
                      minHeight={5}
                    >
                      <img
                        src={imagePreviewUrl}
                        alt="Image à recadrer"
                        onError={markImageLoadFailed}
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
                  onClick={() => void convert()}
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
                  <button type="button" className="btnSecondary" onClick={reset}>
                    <MdRefresh /> Convertir une autre image
                  </button>
                  <button type="button" className="btnPrimary" onClick={navigateBack}>
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
