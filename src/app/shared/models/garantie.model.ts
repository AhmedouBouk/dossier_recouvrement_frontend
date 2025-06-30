export interface Garantie {
    id?: number;
    titre: string;
    typeGarantie?: string;
    valeurGarantie?: number;
    filePath: string;
    uploadDate: Date;
    dossierId: number;
}
