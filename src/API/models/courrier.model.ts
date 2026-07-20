import type { ICourrier } from "../../utils/types/index.ts";

export const courrierModel = (fetchedCourrier: ICourrier): ICourrier => {
  return {
    id: fetchedCourrier.id,
    fileName: fetchedCourrier.fileName,
    path: fetchedCourrier.path,
    fileExtention: fetchedCourrier.fileExtention,
    active: fetchedCourrier.active,
    department: fetchedCourrier.department,
    kind: fetchedCourrier.kind,
    direction: fetchedCourrier.direction,
    recipient: fetchedCourrier.recipient,
    emitter: fetchedCourrier.emitter,
    priority: fetchedCourrier.priority,
    receptionDate: fetchedCourrier.receptionDate,
    courrierDate: fetchedCourrier.courrierDate,
    description: fetchedCourrier.description,
    created_at: fetchedCourrier.created_at,
    updated_at: fetchedCourrier.updated_at,
    addByUser: fetchedCourrier.addByUser,
    updateByUser: fetchedCourrier.updateByUser,
    createurUser: fetchedCourrier.createurUser,
    modificateurUser: fetchedCourrier.modificateurUser,
  };
};
