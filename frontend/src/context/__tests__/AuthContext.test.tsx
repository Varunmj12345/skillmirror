import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';
import * as authService from '../../services/auth';

jest.mock('../../services/auth');
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    pathname: '/',
    asPath: '/',
  }),
}));

const TestConsumer: React.FC = () => {
  const { user, loading, login, logout } = useAuth();

  if (loading) return <div>Auth Loading...</div>;

  return (
    <div>
      <div data-testid="user-name">{user ? user.name : 'Guest'}</div>
      <button
        onClick={() => login({ email: 'test@user.com', password: 'pass' })}
        data-testid="login-btn"
      >
        Login Action
      </button>
      <button onClick={() => logout()} data-testid="logout-btn">
        Logout Action
      </button>
    </div>
  );
};

describe('AuthContext and AuthProvider', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('initializes with loading and resolves current user', async () => {
    (authService.getCurrentUser as jest.Mock).mockResolvedValueOnce({
      id: 10,
      username: 'alice',
      email: 'alice@example.com',
      name: 'alice',
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    expect(screen.getByText('Auth Loading...')).toBeInTheDocument();

    const userName = await screen.findByTestId('user-name');
    expect(userName).toHaveTextContent('alice');
  });

  it('updates state upon login and clears upon logout', async () => {
    (authService.getCurrentUser as jest.Mock).mockResolvedValueOnce(null);
    (authService.loginUser as jest.Mock).mockResolvedValueOnce({
      id: 11,
      username: 'bob',
      email: 'bob@example.com',
      name: 'bob',
    });
    (authService.logoutUser as jest.Mock).mockResolvedValueOnce(undefined);

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    const userName = await screen.findByTestId('user-name');
    expect(userName).toHaveTextContent('Guest');

    await act(async () => {
      screen.getByTestId('login-btn').click();
    });

    expect(screen.getByTestId('user-name')).toHaveTextContent('bob');

    await act(async () => {
      screen.getByTestId('logout-btn').click();
    });

    expect(screen.getByTestId('user-name')).toHaveTextContent('Guest');
  });
});
