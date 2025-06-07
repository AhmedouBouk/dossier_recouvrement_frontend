export interface CreditFile {
  id: number;
  title: string;
  filePath: string | null;
  creditNumber?: string;
  montant?: number;
  dateEcheance?: string | Date;
  uploadDate: string | Date;
}

export interface CreditFileUpdateDto {
  id: number;
  title: string;
  creditNumber?: string;
  montant?: number;
  dateEcheance?: string | Date;
  dossierId?: number;
}
