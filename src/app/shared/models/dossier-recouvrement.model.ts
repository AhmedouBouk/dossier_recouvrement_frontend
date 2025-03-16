export enum DossierStatus {
  EN_COURS = 'EN_COURS',
  TERMINE = 'TERMINE',
  SUSPENDU = 'SUSPENDU',
  ANNULE = 'ANNULE'
}

export enum EtatValidation {
  INITIALE = 'INITIALE',
  VALIDE = 'VALIDE',
  NON_VALIDE = 'NON_VALIDE'
}

export interface Comment {
  id?: number;
  content: string;
  createdAt: string; // Format ISO (ex: "2023-10-25T14:30:00.000+00:00")
  dossier?: any;

}

export interface DossierRecouvrement {
    id: number;
    
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
    referencesChecks: string;
    referencesCredits: string;
    referencesCautions: string;
    referencesLC: string;
    provision: number;
    interetsReserves: number;
    status: DossierStatus;
    etatValidation: EtatValidation;
    garantiesTitre: string;
    garantiesValeur: number;
    garantiesFile: string;
    creditsFile: string;
    cautionsFile: string;
    lcFile: string;
    chequeFile: string;
    dateCreation: Date; // Assurez-vous que cette propriété existe
    selectedFile?: File; // Ajoutez cette propriété
    selectedCreditsFile? :File
    selectedCautionsFile?:File
    selectedLcFile?:File
    comments?: Comment[];

  
  }
  