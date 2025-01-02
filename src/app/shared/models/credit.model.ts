export interface Credit {
  idCredit: number;
  compte: {
      nomCompte: string;
  };
  garantie: {
      idGarantie: number;
  };
  montant: number;
  tauxInteret: number;
  duree: number;
  dateDebut: string;
  statut: string;
  refTransaction: string;
  fondDossier: string;
}

export interface CreditDTO {
  montant: number;
  tauxInteret: number;
  duree: number;
  dateDebut: string;
  statut: string;
  refTransaction: string;
  idCompte: string;
  idGarantie: number;
  fondDossier: string;
}