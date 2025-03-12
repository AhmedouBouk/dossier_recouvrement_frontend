import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Agence {
  id: number;
  code: string;
  nom: string;
}

@Injectable({
  providedIn: 'root'
})
export class AgenceService {
  private readonly apiUrl = `${environment.apiUrl}/agences`;

  constructor(private readonly http: HttpClient) {}

  // Récupérer toutes les agences
  getAllAgences(): Observable<Agence[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      map(response => {
        console.log('Raw agence response:', response);
        
        // Si la réponse est un tableau, on le retourne directement
        if (Array.isArray(response)) {
          return this.ensureAgenceIds(response);
        }
        
        // Si la réponse est un objet avec une propriété _embedded
        if (response?._embedded) {
          // Chercher la liste d'agences dans _embedded
          const embedded = response._embedded;
          
          if (embedded.agences) {
            return this.ensureAgenceIds(embedded.agences);
          }
          
          if (embedded.agenceList) {
            return this.ensureAgenceIds(embedded.agenceList);
          }
          
          // Chercher le premier tableau dans _embedded
          const firstArrayKey = Object.keys(embedded).find(key => Array.isArray(embedded[key]));
          if (firstArrayKey) {
            return this.ensureAgenceIds(embedded[firstArrayKey]);
          }
        }
        
        // Si la réponse a une propriété data qui est un tableau
        if (response?.data && Array.isArray(response.data)) {
          return this.ensureAgenceIds(response.data);
        }
        
        // Si la réponse est un objet unique, on le met dans un tableau
        if (response && typeof response === 'object' && !Array.isArray(response)) {
          return this.ensureAgenceIds([response]);
        }
        
        // Si rien ne correspond, on retourne un tableau vide
        console.error('Format de réponse inattendu pour les agences:', response);
        return [];
      })
    );
  }

  // S'assurer que chaque agence a un ID valide
  private ensureAgenceIds(agences: any[]): Agence[] {
    return agences.map((agence, index) => {
      // Si l'agence a déjà un ID valide, on le garde
      if (agence.id && typeof agence.id === 'number') {
        return agence as Agence;
      }
      
      // Si l'agence a un ID mais pas sous forme de nombre, on essaie de le convertir
      if (agence.id && typeof agence.id !== 'number') {
        const numericId = Number(agence.id);
        if (!isNaN(numericId)) {
          return { ...agence, id: numericId };
        }
      }
      
      // Si l'agence a un champ 'agenceId', on l'utilise comme ID
      if (agence.agenceId && typeof agence.agenceId === 'number') {
        return { ...agence, id: agence.agenceId };
      }
      
      // Si l'agence a un champ '_id', on l'utilise comme ID
      if (agence._id) {
        const numericId = typeof agence._id === 'number' ? agence._id : Number(agence._id);
        if (!isNaN(numericId)) {
          return { ...agence, id: numericId };
        }
      }
      
      // Vérifier si l'ID est dans un sous-objet comme '_links.self.href'
      if (agence._links?.self?.href) {
        const hrefParts = agence._links.self.href.split('/');
        const lastPart = hrefParts[hrefParts.length - 1];
        const numericId = Number(lastPart);
        if (!isNaN(numericId)) {
          return { ...agence, id: numericId };
        }
      }
      
      // Si aucun ID valide n'est trouvé, on génère un ID temporaire basé sur l'index
      console.warn(`Agence sans ID valide trouvée, génération d'un ID temporaire: ${index + 1000}`, agence);
      return { ...agence, id: index + 1000 };
    });
  }

  // Récupérer une agence par son ID
  getAgenceById(id: number): Observable<Agence> {
    return this.http.get<Agence>(`${this.apiUrl}/${id}`);
  }

  // Créer une nouvelle agence
  createAgence(agence: Omit<Agence, 'id'>): Observable<Agence> {
    return this.http.post<Agence>(this.apiUrl, agence);
  }

  // Mettre à jour une agence existante
  updateAgence(id: number, agence: Omit<Agence, 'id'>): Observable<Agence> {
    return this.http.put<Agence>(`${this.apiUrl}/${id}`, agence);
  }

  // Supprimer une agence
  deleteAgence(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
