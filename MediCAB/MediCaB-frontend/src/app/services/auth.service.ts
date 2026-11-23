
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

const API_URL = 'http://127.0.0.1:8000/api';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly tokenKey = 'medicab_token';

  constructor(private http: HttpClient) {}

  // =========================
  // EN-TÊTES D'AUTHENTIFICATION
  // =========================

  private getAuthHeaders(): HttpHeaders {
    const token = this.getToken();

    return new HttpHeaders(
      token ? { Authorization: `Token ${token}` } : {}
    );
  }

  // =========================
  // AUTHENTIFICATION
  // =========================

  register(data: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone?: string;
    role: string;
  }): Observable<any> {
    return this.http.post<any>(
      `${API_URL}/auth/register/`,
      data
    ).pipe(
      tap(response => {
        if (response.token) {
          localStorage.setItem(this.tokenKey, response.token);
        }
      })
    );
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(
      `${API_URL}/auth/login/`,
      { email, password }
    ).pipe(
      tap(response => {
        if (response.token) {
          localStorage.setItem(this.tokenKey, response.token);
        }
      })
    );
  }

  logout(): Observable<any> {
    return this.http.post(
      `${API_URL}/auth/logout/`,
      {},
      { headers: this.getAuthHeaders() }
    ).pipe(
      tap(() => this.clearToken())
    );
  }

  getCurrentUser(): Observable<any> {
    return this.http.get<any>(
      `${API_URL}/auth/me/`,
      { headers: this.getAuthHeaders() }
    );
  }

  // =========================
  // UTILISATEURS
  // =========================

  getUsers(role?: string): Observable<any> {
    let params = new HttpParams();

    if (role) {
      params = params.set('role', role);
    }

    return this.http.get<any>(
      `${API_URL}/users/`,
      {
        headers: this.getAuthHeaders(),
        params
      }
    );
  }

  createUser(data: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone?: string;
    role: string;
  }): Observable<any> {
    return this.http.post<any>(
      `${API_URL}/users/`,
      data,
      { headers: this.getAuthHeaders() }
    );
  }

  updateUser(id: number | string, data: any): Observable<any> {
    return this.http.patch<any>(
      `${API_URL}/users/${id}/`,
      data,
      { headers: this.getAuthHeaders() }
    );
  }

  deleteUser(id: number | string): Observable<any> {
    return this.http.delete(
      `${API_URL}/users/${id}/`,
      { headers: this.getAuthHeaders() }
    );
  }

  // =========================
  // RÔLES
  // =========================

  getRoles(): Observable<any[]> {
    return this.http.get<any[]>(
      `${API_URL}/roles/`,
      { headers: this.getAuthHeaders() }
    );
  }

  // =========================
  // PERMISSIONS
  // =========================

  getPermissions(): Observable<any> {
    return this.http.get<any>(
      `${API_URL}/permissions/`,
      { headers: this.getAuthHeaders() }
    );
  }

  createPermission(data: {
    code: string;
    description?: string;
  }): Observable<any> {
    return this.http.post<any>(
      `${API_URL}/permissions/`,
      data,
      { headers: this.getAuthHeaders() }
    );
  }

  updatePermission(id: number | string, data: any): Observable<any> {
    return this.http.patch<any>(
      `${API_URL}/permissions/${id}/`,
      data,
      { headers: this.getAuthHeaders() }
    );
  }

  deletePermission(id: number | string): Observable<any> {
    return this.http.delete(
      `${API_URL}/permissions/${id}/`,
      { headers: this.getAuthHeaders() }
    );
  }

  // =========================
  // ASSOCIATIONS RÔLES - PERMISSIONS
  // =========================

  getRolePermissions(): Observable<any> {
    return this.http.get<any>(
      `${API_URL}/role-permissions/`,
      { headers: this.getAuthHeaders() }
    );
  }

  createRolePermission(data: {
    role: string;
    permission: number;
  }): Observable<any> {
    return this.http.post<any>(
      `${API_URL}/role-permissions/`,
      data,
      { headers: this.getAuthHeaders() }
    );
  }

  updateRolePermission(id: number | string, data: any): Observable<any> {
    return this.http.patch<any>(
      `${API_URL}/role-permissions/${id}/`,
      data,
      { headers: this.getAuthHeaders() }
    );
  }

  deleteRolePermission(id: number | string): Observable<any> {
    return this.http.delete(
      `${API_URL}/role-permissions/${id}/`,
      { headers: this.getAuthHeaders() }
    );
  }

  // =========================
  // JOURNAL D'ACTIVITÉ
  // =========================

  getAuditLogs(): Observable<any> {
    return this.http.get<any>(
      `${API_URL}/audit-logs/`,
      { headers: this.getAuthHeaders() }
    );
  }

  createAuditLog(data: {
    action: string;
    module: string;
    description: string;
  }): Observable<any> {
    return this.http.post<any>(
      `${API_URL}/audit-logs/`,
      data,
      { headers: this.getAuthHeaders() }
    );
  }
    // GESTION DES DONNÉES DES MODULES MÉTIER

  getModuleRecords(moduleKey: string): Observable<any[]> {
    return this.http.get<any>(
      `${API_URL}/data/${encodeURIComponent(moduleKey)}/`,
      { headers: this.getAuthHeaders() }
    );
  }

  createModuleRecord(moduleKey: string, data: any): Observable<any> {
    return this.http.post<any>(
      `${API_URL}/data/${encodeURIComponent(moduleKey)}/`,
      data,
      { headers: this.getAuthHeaders() }
    );
  }

  updateModuleRecord(
    moduleKey: string,
    id: string,
    data: any
  ): Observable<any> {
    return this.http.patch<any>(
      `${API_URL}/data/${encodeURIComponent(moduleKey)}/${encodeURIComponent(id)}/`,
      data,
      { headers: this.getAuthHeaders() }
    );
  }

  deleteModuleRecord(moduleKey: string, id: string): Observable<any> {
    return this.http.delete(
      `${API_URL}/data/${encodeURIComponent(moduleKey)}/${encodeURIComponent(id)}/`,
      { headers: this.getAuthHeaders() }
    );
  }

  // =========================
  // FONCTIONNALITÉS IA & CNSS
  // =========================

  draftConsultationAI(data: {
    notes_brutes: string;
    patient_name?: string;
    age?: number;
    motif?: string;
    tension?: string;
    temperature?: number;
  }): Observable<any> {
    return this.http.post<any>(`${API_URL}/ai/draft-consultation/`, data);
  }

  patientTriageAI(message: string): Observable<any> {
    return this.http.post<any>(`${API_URL}/ai/patient-triage/`, { message });
  }

  predictNoShowAI(data: {
    delai_prise_rdv_jours: number;
    age_patient: number;
    historique_absences: number;
    rappel_sms_envoye: boolean;
    jour_semaine: number;
  }): Observable<any> {
    return this.http.post<any>(`${API_URL}/ai/predict-noshow/`, data);
  }

  calculateCNSSAI(data: {
    type_prestation: string;
    montant_facture: number;
    est_ald: boolean;
  }): Observable<any> {
    return this.http.post<any>(`${API_URL}/ai/cnss-calculator/`, data);
  }

  // =========================
  // GESTION DU TOKEN
  // =========================

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  clearToken(): void {
    localStorage.removeItem(this.tokenKey);
  }
}
