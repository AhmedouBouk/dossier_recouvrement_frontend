export interface Credit {
    id: number;
    montant: number;
    tauxInteret: number;
    duree: number;
    statut: string;
    dateDebut: string;
    idCompte: string; // Référence à l'entité Compte
    idGarantie: number; // Référence à l'entité Garantie
  }
  