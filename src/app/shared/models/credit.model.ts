export interface Credit {
  idCredit: number;
  compte: {
      nomCompte: string;
  };
  montant: number;
  tauxInteret: number;
  duree: number;
  dateDebut: string;
  statut: string;
  refTransaction: string;
  typeGarantie: string;
  valeurGarantie: number;
  fondDossier: string;
}

export interface CreditDTO {
  montant: number;
  tauxInteret: number;
  duree: number;
  dateDebut: string;
  statut: string;
  refTransaction: string;
  typeGarantie: string;
  valeurGarantie: number;
  idCompte: string;
  fondDossier: string;
}