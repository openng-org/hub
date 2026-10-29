import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';

import { API_CLIENT_HEADER, API_CLIENT_VALUE } from '../../../site';
import { apiInterceptor } from './api-interceptor';

describe('apiInterceptor', () => {
  it('marks API requests as the web app’s, and only those', () => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([apiInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    const http = TestBed.inject(HttpClient);
    const backend = TestBed.inject(HttpTestingController);
    http.get('/api/home').subscribe();
    http.get('/logos/x.webp').subscribe();
    expect(backend.expectOne('/api/home').request.headers.get(API_CLIENT_HEADER)).toBe(
      API_CLIENT_VALUE,
    );
    expect(backend.expectOne('/logos/x.webp').request.headers.has(API_CLIENT_HEADER)).toBe(false);
    backend.verify();
  });
});
