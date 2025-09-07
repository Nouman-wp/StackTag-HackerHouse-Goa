const BASE_URL = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

// Users API
export async function getUser(username) {
  const response = await fetch(`${BASE_URL}/users/${username}`);
  if (!response.ok) {
    throw new Error('User not found');
  }
  return response.json();
}

export async function createUser(userData) {
  const response = await fetch(`${BASE_URL}/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create user');
  }
  
  return response.json();
}

export async function updateUser(username, updates) {
  const response = await fetch(`${BASE_URL}/users/${username}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update user');
  }
  
  return response.json();
}

export async function searchUsers(query, limit = 20, skip = 0) {
  const params = new URLSearchParams({ q: query, limit, skip });
  const response = await fetch(`${BASE_URL}/users?${params}`);
  
  if (!response.ok) {
    throw new Error('Search failed');
  }
  
  return response.json();
}

// SBTs API
export async function getUserSBTs(username, category = null, limit = 50, skip = 0) {
  const params = new URLSearchParams({ limit, skip });
  if (category) params.append('category', category);
  
  const response = await fetch(`${BASE_URL}/users/${username}/sbts?${params}`);
  if (!response.ok) {
    throw new Error('Failed to fetch SBTs');
  }
  
  return response.json();
}

export async function issueSBT(sbtData) {
  const response = await fetch(`${BASE_URL}/sbts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(sbtData),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to issue SBT');
  }
  
  return response.json();
}

export async function getSBT(tokenId) {
  const response = await fetch(`${BASE_URL}/sbts/${tokenId}`);
  if (!response.ok) {
    throw new Error('SBT not found');
  }
  
  return response.json();
}

// Upload API
export async function uploadImage(file) {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(`${BASE_URL}/upload/image`, {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Upload failed');
  }
  
  return response.json();
}

// Legacy API for backwards compatibility
export const getProfile = getUser;
export const upsertProfile = createUser;