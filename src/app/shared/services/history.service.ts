import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { HistoryEvent } from '../models/history-event.model';
import { AuthService } from '../../auth/auth.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HistoryService {
  private readonly apiUrl = `${environment.apiUrl}/api/history`;
  private readonly historyEventsSubject = new BehaviorSubject<HistoryEvent[]>([]);
  public readonly historyEvents$ = this.historyEventsSubject.asObservable();

  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthService
  ) {
    this.loadHistory();
  }

  loadHistory(): void {
    this.http.get<HistoryEvent[]>(this.apiUrl)
      .pipe(
        catchError(error => {
          console.error('Error loading history:', error);
          return of<HistoryEvent[]>([]);
        })
      )
      .subscribe(events => {
        this.historyEventsSubject.next(events);
      });
  }

  getHistory(): Observable<HistoryEvent[]> {
    return this.historyEvents$;
  }

  addEvent(action: string, entityType: string, entityId?: string | number, entityName?: string, details?: string): Observable<HistoryEvent> {
    const event: HistoryEvent = {
      timestamp: new Date(),
      username: '',
      action,
      entityType,
      entityId,
      entityName,
      details
    };

    return this.http.post<HistoryEvent>(this.apiUrl, event)
      .pipe(
        tap(newEvent => {
          const currentEvents = this.historyEventsSubject.value;
          this.historyEventsSubject.next([newEvent, ...currentEvents]);
        }),
        catchError(error => {
          console.error('Error adding history event:', error);
          return throwError(() => new Error('Failed to add history event'));
        })
      );
  }

  logImport(fileName: string, details?: string): Observable<HistoryEvent> {
    return this.http.post<HistoryEvent>(`${this.apiUrl}/import`, { fileName, details })
      .pipe(
        tap(newEvent => {
          const currentEvents = this.historyEventsSubject.value;
          this.historyEventsSubject.next([newEvent, ...currentEvents]);
        }),
        catchError(error => {
          console.error('Error logging import:', error);
          return throwError(() => new Error('Failed to log import'));
        })
      );
  }

  logDelete(entityType: string, entityId: string | number, entityName?: string): Observable<HistoryEvent> {
    return this.http.post<HistoryEvent>(`${this.apiUrl}/delete`, { entityType, entityId, entityName })
      .pipe(
        tap(newEvent => {
          const currentEvents = this.historyEventsSubject.value;
          this.historyEventsSubject.next([newEvent, ...currentEvents]);
        }),
        catchError(error => {
          console.error('Error logging delete:', error);
          return throwError(() => new Error('Failed to log delete'));
        })
      );
  }
}
