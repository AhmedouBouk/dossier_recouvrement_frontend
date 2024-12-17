import{Credit} from './credit.model';
export class DossierRecouvrement {
    idDossier: number;
    accountNumber: string;
    impaye: number;
    dateCreation: Date;
    status: string;
    sold: number;
    PR: string;
    PRP: string;
    ajout: number;
    encour: string;
    principearemboursse: number;
    credit: Credit // Ajouter le credit dans le constructeur
  
    constructor(
      idDossier: number,
      accountNumber: string,
      impaye: number,
      dateCreation: Date,
      status: string,
      sold: number,
      PR: string,
      PRP: string,
      ajout: number,
      encour: string,
      principearemboursse: number,
      credit: Credit // Ajouter le credit dans le constructeur

    ) {
      this.idDossier = idDossier;
      this.accountNumber = accountNumber;
      this.impaye = impaye;
      this.dateCreation = dateCreation;
      this.status = status;
      this.sold = sold;
      this.PR = PR;
      this.PRP = PRP;
      this.ajout = ajout;
      this.encour = encour;
      this.principearemboursse = principearemboursse;
      this.credit=credit;
    }
  }
  