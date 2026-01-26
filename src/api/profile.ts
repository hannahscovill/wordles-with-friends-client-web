const API_BASE_URL: string =
  import.meta.env.PUBLIC_API_URL ?? 'https://localhost:8080';

export interface UserProfile {
  userId: string;
  displayName: string;
  avatarUrl: string;
}

export interface UpdateProfileRequest {
  displayName: string;
  avatarUrl: string;
}

export const getUserProfile = async (
  token: string,
): Promise<UserProfile | null> => {
  try {
    const response: Response = await fetch(`${API_BASE_URL}/profile`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error(`Failed to get profile: ${response.status}`);
    }

    return (await response.json()) as UserProfile;
  } catch (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
};

export const updateUserProfile = async (
  token: string,
  data: UpdateProfileRequest,
): Promise<UserProfile> => {
  const response: Response = await fetch(`${API_BASE_URL}/profile`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Failed to update profile: ${response.status}`);
  }

  return (await response.json()) as UserProfile;
};
