export interface Credit {
    idCredit: number;
    idCompte: string;
    idGarantie: string;
    montant: number;
    tauxInteret: number;
    duree: number;
    dateDebut: string;
    statut: string;
    refTransaction: string;
    demande?: File;
    etude?: File;
    bulletinSalaire?: File;
    domiciliation?: File;
    pvComite?: File;
    bonPourAval?: File;
    reconnaissanceDeDette?: File;
    contrat?: File;
    tableauAmortissement?: File;
  }
  