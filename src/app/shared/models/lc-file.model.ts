// src/app/shared/models/lc-file.model.ts

export interface LcFile {
  id: number;
  title: string;
  filePath: string;
  uploadDate: string; // Consider converting to Date object in component if needed
  lcNumber?: string;
  montant?: number;
  dateEcheance?: string; // Consider converting to Date object in component if needed
  dossierId: number; // Added to track which dossier this LC file belongs to
  // No need for DossierRecouvrement object here to avoid circular dependencies if not essential for display
}
