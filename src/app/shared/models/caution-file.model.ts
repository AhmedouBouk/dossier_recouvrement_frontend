export interface CautionFile {
  id: number;
  title: string;
  filePath: string;
  uploadDate: string; // Consider converting to Date object in component if needed
  cautionNumber?: string;
  montant?: number;
  dateEcheance?: string; // Consider converting to Date object in component if needed
  dossierId: number; // Added to track which dossier this caution belongs to
  // No need for DossierRecouvrement object here to avoid circular dependencies if not essential for display
}

export interface CautionFileUpdateDto {
  title: string;
  cautionNumber?: string;
  montant?: number;
  dateEcheance?: string;
}
