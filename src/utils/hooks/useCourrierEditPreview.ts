import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { ICourrier, ICourrierFormData } from "../types/courrier.types.ts";
import {
  downloadCourrierService,
  getCourrierByIdService,
} from "../../API/services/courrier.service.ts";
import { generateViewUrlService } from "../../API/services/viewUrl.service.ts";
import {
  handleCourrierLoadError,
  logError,
  showErrorNotification,
} from "../scripts/errorHandling.ts";

export interface CourrierEditPreviewResult {
  courrier: ICourrier | null;
  formDefaults: ICourrierFormData | null;
  pdfUrl: string;
  fileType: "pdf" | "image";
  loadingCourrier: boolean;
}

/**
 * Charge un courrier par son ID et génère l'URL de prévisualisation adaptée
 * au type de fichier (PDF → URL signée, image → Blob URL).
 * Gère le cleanup des Blob URLs et redirige en cas d'erreur.
 */
export const useCourrierEditPreview = (
  id: string | undefined
): CourrierEditPreviewResult => {
  const navigate = useNavigate();
  const [courrier, setCourrier] = useState<ICourrier | null>(null);
  const [formDefaults, setFormDefaults] = useState<ICourrierFormData | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const [fileType, setFileType] = useState<"pdf" | "image">("pdf");
  const [loadingCourrier, setLoadingCourrier] = useState<boolean>(true);

  useEffect(() => {
    if (!id) return;

    let blobUrl = "";

    const fetchCourrier = async () => {
      try {
        setLoadingCourrier(true);

        const courrierData = await getCourrierByIdService(parseInt(id));
        setCourrier(courrierData);

        setFormDefaults({
          direction: courrierData.direction,
          emitter: courrierData.emitter || "",
          recipient: courrierData.recipient || "",
          receptionDate: courrierData.receptionDate
            ? courrierData.receptionDate.split("T")[0]
            : "",
          courrierDate: courrierData.courrierDate
            ? courrierData.courrierDate.split("T")[0]
            : "",
          priority: courrierData.priority || "normal",
          department: courrierData.department || "",
          kind: courrierData.kind || "",
          description: courrierData.description || "",
          customFileName: courrierData.fileName.replace(/\.[^/.]+$/, "") || "",
        });

        const isImage = courrierData.fileName
          .toLowerCase()
          .match(/\.(jpg|jpeg|png|gif|bmp|webp)$/);

        if (isImage) {
          const blob = await downloadCourrierService(courrierData.id);
          blobUrl = URL.createObjectURL(blob);
          setPdfUrl(blobUrl);
          setFileType("image");
        } else {
          const viewUrlData = await generateViewUrlService(courrierData.id, 10);
          setPdfUrl(viewUrlData.viewUrl);
          setFileType("pdf");
        }
      } catch (error: unknown) {
        logError("useCourrierEditPreview", error);
        const errorMessage = handleCourrierLoadError(error);
        showErrorNotification(errorMessage);
        navigate("/mail/list");
      } finally {
        setLoadingCourrier(false);
      }
    };

    fetchCourrier();

    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [id, navigate]);

  return { courrier, formDefaults, pdfUrl, fileType, loadingCourrier };
};
