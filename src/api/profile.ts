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

export interface UploadAvatarResponse {
  avatarUrl: string;
}

export const uploadAvatar = async (
  token: string,
  file: File,
): Promise<UploadAvatarResponse> => {
  const MAX_FILE_SIZE: number = 2 * 1024 * 1024; // 2MB

  if (file.size > MAX_FILE_SIZE) {
    throw new Error('Image must be less than 2MB.');
  }

  const formData: FormData = new FormData();
  formData.append('avatar', file);

  const response: Response = await fetch(`${API_BASE_URL}/profile/avatar`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText: string = await response.text();
    throw new Error(
      `Failed to upload avatar: ${response.status} - ${errorText}`,
    );
  }

  return (await response.json()) as UploadAvatarResponse;
};
