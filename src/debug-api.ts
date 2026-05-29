// Debug script to test api client response
import { apiClient } from './infrastructure/api/api-client';

export async function debugApi() {
  console.log('=== Debug API Responses ===');
  
  // Login first
  const loginResp = await apiClient.post('/auth/login', {
    email: 'admin@gentleman.com',
    password: 'Gentleman2026!'
  });
  console.log('\n1. LOGIN response:');
  console.log(JSON.stringify(loginResp, null, 2));
  
  // Test users
  const usersResp = await apiClient.get('/users?page=1&limit=2');
  console.log('\n2. USERS response:');
  console.log(JSON.stringify(usersResp, null, 2));
  
  // Test taxes
  const taxesResp = await apiClient.get('/taxes?page=1&limit=2');
  console.log('\n3. TAXES response:');
  console.log(JSON.stringify(taxesResp, null, 2));
}
