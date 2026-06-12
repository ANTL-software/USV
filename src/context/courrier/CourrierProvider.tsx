import { useState, useMemo, useCallback, ReactElement } from "react";
import { CourrierContext } from "./CourrierContext.tsx";
import { ICourrier, ICourrierUploadData, ICourrierSearchParams, IPagination, ICourrierStats, ICourrierListParams, ICourrierAnalysisResult } from "../../utils/types/courrier.types.ts";
import {
  uploadCourrierService,
  getAllCourriersService,
  getCourrierByIdService,
  updateCourrierService,
  deleteCourrierService,
  searchCourriersService,
  downloadCourrierService,
  sendCourrierEmailService,
  getCourrierStatsService,
  analyzeCourrierService
} from "../../API/services/courrier.service.ts";

export const CourrierProvider = ({
  children,
}: {
  children: ReactElement;
}): ReactElement => {
  const [courriers, setCourriers] = useState<ICourrier[]>([]);
  const [currentCourrier, setCurrentCourrier] = useState<ICourrier | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [pagination, setPagination] = useState<IPagination | null>(null);
  const [stats, setStats] = useState<ICourrierStats | null>(null);

  const uploadCourrier = useCallback(async (file: File, metadata: ICourrierUploadData): Promise<ICourrier> => {
    setIsLoading(true);
    try {
      const newCourrier = await uploadCourrierService(file, metadata);
      setCourriers(prev => [newCourrier, ...prev]);
      return newCourrier;
    } catch (error) {
      console.error("Error while uploading courrier:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getAllCourriers = useCallback(async (params: ICourrierListParams = {}): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await getAllCourriersService(params);
      setCourriers(response.courriers);
      setPagination(response.pagination);
    } catch (error) {
      console.error("Error while getting courriers:", error);
      setCourriers([]);
      setPagination(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getCourrierById = async (id: number): Promise<void> => {
    setIsLoading(true);
    try {
      const courrier = await getCourrierByIdService(id);
      setCurrentCourrier(courrier);
    } catch (error) {
      console.error("Error while getting courrier:", error);
      setCurrentCourrier(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateCourrier = useCallback(async (id: number, metadata: Partial<ICourrierUploadData>): Promise<ICourrier> => {
    setIsLoading(true);
    try {
      const updatedCourrier = await updateCourrierService(id, metadata);

      setCourriers(prev =>
        prev.map(courrier =>
          courrier.id === id ? updatedCourrier : courrier
        )
      );

      if (currentCourrier?.id === id) {
        setCurrentCourrier(updatedCourrier);
      }

      return updatedCourrier;
    } catch (error) {
      console.error("Error while updating courrier:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [currentCourrier]);

  const deleteCourrier = useCallback(async (id: number): Promise<void> => {
    setIsLoading(true);
    try {
      await deleteCourrierService(id);

      setCourriers(prev => prev.filter(courrier => courrier.id !== id));

      if (currentCourrier?.id === id) {
        setCurrentCourrier(null);
      }
    } catch (error) {
      console.error("Error while deleting courrier:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [currentCourrier]);

  const searchCourriers = useCallback(async (params: ICourrierSearchParams): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await searchCourriersService(params);
      setCourriers(response.courriers);
      setPagination(response.pagination);
    } catch (error) {
      console.error("Error while searching courriers:", error);
      setCourriers([]);
      setPagination(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const downloadCourrier = useCallback(async (id: number): Promise<Blob> => {
    setIsLoading(true);
    try {
      const blob = await downloadCourrierService(id);
      return blob;
    } catch (error) {
      console.error("Error while downloading courrier:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const sendCourrierEmail = useCallback(async (
    id: number,
    emailData: { to: string; subject: string; message: string }
  ): Promise<void> => {
    setIsLoading(true);
    try {
      await sendCourrierEmailService(id, emailData);
    } catch (error) {
      console.error("Error while sending courrier email:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getCourrierStats = useCallback(async (): Promise<void> => {
    try {
      const statsData = await getCourrierStatsService();
      setStats(statsData);
    } catch (error) {
      console.error("Error while getting courrier stats:", error);
      setStats(null);
      throw error;
    }
  }, []);

  const analyzeCourrier = useCallback(async (
    file: File,
    options?: {
      kindOptions?: string[];
      departmentOptions?: string[];
    }
  ): Promise<ICourrierAnalysisResult> => {
    return await analyzeCourrierService(file, options);
  }, []);

  const contextValue = useMemo(
    () => ({
      courriers,
      currentCourrier,
      isLoading,
      pagination,
      stats,
      setCourriers,
      setCurrentCourrier,
      uploadCourrier,
      getAllCourriers,
      getCourrierById,
      updateCourrier,
      deleteCourrier,
      searchCourriers,
      downloadCourrier,
      sendCourrierEmail,
      getCourrierStats,
      analyzeCourrier,
    }),
    [courriers, currentCourrier, isLoading, pagination, stats, uploadCourrier, getAllCourriers, deleteCourrier, downloadCourrier, getCourrierStats, updateCourrier, searchCourriers, sendCourrierEmail, analyzeCourrier],
  );

  return (
    <CourrierContext.Provider value={contextValue}>
      {children}
    </CourrierContext.Provider>
  );
};
