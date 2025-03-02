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

export interface DossierRecouvrement {
    idDossier: number;
    compte: {
      nomCompte: string;
    };
    engagementTotal: number;
    montantPrincipal: number;
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
  
  }
  