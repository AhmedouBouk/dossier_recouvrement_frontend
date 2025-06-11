export interface ChequeFile {
  id: number;
  title: string;
  filePath: string;
  uploadDate: string; // Consider converting to Date object in component if needed
  chequeNumber?: string;
  montant?: number;
  dateEcheance?: string; // Consider converting to Date object in component if needed
  dossierId: number; // Added to track which dossier this cheque belongs to
  // No need for DossierRecouvrement object here to avoid circular dependencies if not essential for display
}

export interface ChequeFileUpdateDto {
  title: string;
  chequeNumber?: string;
  montant?: number;
  dateEcheance?: string;
}
