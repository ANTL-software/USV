import { ICourrier, ICourrierUploadData, ICourrierSearchParams, IPagination, ICourrierStats, ICourrierListParams, ICourrierAnalysisResult } from "../../utils/types/courrier.types.ts";
import { createContext, Context } from "react";

interface ICourrierContext {
  courriers: ICourrier[];
  currentCourrier: ICourrier | null;
  isLoading: boolean;
  pagination: IPagination | null;
  stats: ICourrierStats | null;
  setCourriers: (courriers: ICourrier[]) => void;
  setCurrentCourrier: (courrier: ICourrier | null) => void;
  uploadCourrier: (file: File, metadata: ICourrierUploadData) => Promise<ICourrier>;
  getAllCourriers: (params?: ICourrierListParams) => Promise<void>;
  getCourrierById: (id: number) => Promise<void>;
  updateCourrier: (id: number, metadata: Partial<ICourrierUploadData>) => Promise<ICourrier>;
  deleteCourrier: (id: number) => Promise<void>;
  searchCourriers: (params: ICourrierSearchParams) => Promise<void>;
  downloadCourrier: (id: number) => Promise<Blob>;
  sendCourrierEmail: (id: number, emailData: { to: string; subject: string; message: string }) => Promise<void>;
  getCourrierStats: () => Promise<void>;
  analyzeCourrier: (
    file: File,
    options?: {
      kindOptions?: string[];
      departmentOptions?: string[];
    }
  ) => Promise<ICourrierAnalysisResult>;
}

export const CourrierContext: Context<ICourrierContext> = createContext<ICourrierContext>({
  courriers: [],
  currentCourrier: null,
  isLoading: false,
  pagination: null,
  stats: null,
  setCourriers: (): void => {},
  setCurrentCourrier: (): void => {},
  uploadCourrier: async (): Promise<ICourrier> => { throw new Error("Context not initialized"); },
  getAllCourriers: async (): Promise<void> => {},
  getCourrierById: async (): Promise<void> => {},
  updateCourrier: async (): Promise<ICourrier> => { throw new Error("Context not initialized"); },
  deleteCourrier: async (): Promise<void> => {},
  searchCourriers: async (): Promise<void> => {},
  downloadCourrier: async (): Promise<Blob> => { throw new Error("Context not initialized"); },
  sendCourrierEmail: async (): Promise<void> => {},
  getCourrierStats: async (): Promise<void> => {},
  analyzeCourrier: async (): Promise<ICourrierAnalysisResult> => { throw new Error("Context not initialized"); },
});
