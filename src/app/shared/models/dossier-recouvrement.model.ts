import { Garantie } from './garantie.model';
import { ChequeFile } from './cheque-file.model';
import { LcFile } from './lc-file.model'; // Import LcFile model

export enum EtatValidation {
  INITIALE = 'INITIALE',
  VALIDE = 'VALIDE',
  NON_VALIDE = 'NON_VALIDE',
  ARCHIVEE = 'ARCHIVEE'
}
export enum Status {
    
    EN_COURS = 'EN_COURS',
   
    ARCHIVEE = 'ARCHIVEE'
}

export interface Comment {
  id?: number;
  content: string;
  createdAt: string; // Format ISO (ex: "2023-10-25T14:30:00.000+00:00")
  dossier?: any;

}

export interface DossierRecouvrement {
    id: number;
    accountNumber: string;
    // Fields removed as they don't exist in backend entity
    numeroDossierRecouvrement?: string; // Keep for backward compatibility but marked optional
    nomClientRecouvrement?: string; // Keep for backward compatibility but marked optional
    compte: {
      nomCompte: string;
    };
    engagementTotal: number;
    montantPrincipal: number;
    temporaryFile?: File; // Fichier temporaire avant l'upload (optionnel)

    interetContractuel: number;
    interetRetard: number;
    naturesEngagement: string[];
    agenceOuvertureCompte: string;
    // Fields not in backend entity - marked as optional
    dateOuvertureCompte?: Date;
    situationCompte?: string;
    situationJuridique?: string;
    typeClient?: string;
    natureEngagement?: string;
    natureCredit?: string;
    typeGarantie?: string;
    periodiciteRemboursement?: string;
    dateEcheanceInitiale?: Date;
    dateSituation?: Date;
    referencesChecks: string;
    referencesCredits: string;
    referencesCautions: string;
    referencesLC: string;
    provision: number;
    interetsReserves: number;
    garantiesValeur?: number; // Valeur des garanties
    garantiesTitre?: string; // Pour la compatibilité avec l'ancien code
    creditsFile: string;
    cautionsFile: string;
    lcFile?: string;
    chequeFiles?: ChequeFile[]; // Replaced single chequeFile string with an array of ChequeFile objects
    dateCreation: Date; // Assurez-vous que cette propriété existe
    selectedFile?: File; // Ajoutez cette propriété
    selectedCreditsFile? :File
    selectedCautionsFile?:File
    selectedLcFile?:File
    lcFiles?: LcFile[]; // Array to store multiple LC files associated with this dossier
    cautionFile?: string; // For backward compatibility
    creditFile?: string; // For backward compatibility
    status?: string;  // PAS DossierStatus
    etatValidation: EtatValidation;
    garanties?: Garantie[];
    comments?: Comment[];

   dateArchivage?:Date;
  }