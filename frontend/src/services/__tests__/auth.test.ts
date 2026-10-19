import { loginUser, logoutUser, verifyTwoFactor } from '../auth';
import apiClient from '../apiClient';

jest.mock('../apiClient');

describe('Auth Service', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('stores access token and formats user on successful login', async () => {
    const mockResponse = {
      access: 'mock-jwt-token-123',
      user: {
        id: 1,
        username: 'candidate_one',
        email: 'candidate@skillmirror.ai',
      },
    };

    (apiClient.post as jest.Mock).mockResolvedValueOnce(mockResponse);

    const user = await loginUser({ email: 'candidate@skillmirror.ai', password: 'password123' });

    expect(apiClient.post).toHaveBeenCalledWith('/users/login/', {
      email: 'candidate@skillmirror.ai',
      password: 'password123',
    });
    expect(localStorage.getItem('access_token')).toBe('mock-jwt-token-123');
    expect(user.name).toBe('candidate_one');
    expect(user.email).toBe('candidate@skillmirror.ai');
  });

  it('clears access token on logout', async () => {
    localStorage.setItem('access_token', 'token-to-delete');
    await logoutUser();
    expect(localStorage.getItem('access_token')).toBeNull();
  });

  it('handles 2FA verification and sets token', async () => {
    const mock2FAResponse = {
      access: 'verified-2fa-token',
      user: {
        id: 2,
        username: 'twofa_user',
        email: 'twofa@skillmirror.ai',
      },
    };

    (apiClient.post as jest.Mock).mockResolvedValueOnce(mock2FAResponse);

    const result = await verifyTwoFactor({ email: 'twofa@skillmirror.ai', code: '123456' });

    expect(apiClient.post).toHaveBeenCalledWith('/users/verify-2fa/', {
      email: 'twofa@skillmirror.ai',
      code: '123456',
    });
    expect(localStorage.getItem('access_token')).toBe('verified-2fa-token');
    expect(result.username).toBe('twofa_user');
  });
});
