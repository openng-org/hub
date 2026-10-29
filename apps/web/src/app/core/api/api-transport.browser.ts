import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { API_CLIENT_HEADER, API_CLIENT_VALUE } from '../../../site';
import { ApiTransport } from './api-client';

/** Browser side: GET /api/<path>?<query>, served by the Express server (src/server.ts). */
@Injectable()
export class BrowserApiTransport extends ApiTransport {
  private readonly http = inject(HttpClient);

  async get<T>(path: string, query: URLSearchParams): Promise<T | null> {
    const url = `/api/${path}${query.size ? `?${query}` : ''}`;
    try {
      return await firstValueFrom(
        this.http.get<T>(url, { headers: { [API_CLIENT_HEADER]: API_CLIENT_VALUE } }),
      );
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.status === 404) return null;
      throw error;
    }
  }
}
