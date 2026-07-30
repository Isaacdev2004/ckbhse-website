import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  getAuthSessionQueryKey,
  useAuthSession,
  useLogin,
  useLogout,
  type AuthSessionResponse,
} from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';

interface AuthContextValue {
  readonly session: AuthSessionResponse | undefined;
  readonly isLoading: boolean;
  readonly isAuthenticated: boolean;
  readonly login: (input: {
    email: string;
    password: string;
    rememberMe?: boolean;
  }) => Promise<void>;
  readonly logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const sessionQuery = useAuthSession({
    query: {
      queryKey: getAuthSessionQueryKey(),
      retry: false,
      refetchOnWindowFocus: true,
    },
  });
  const loginMutation = useLogin();
  const logoutMutation = useLogout();
  const [bootstrapped, setBootstrapped] = useState(false);

  useEffect(() => {
    if (sessionQuery.isFetched) {
      setBootstrapped(true);
    }
  }, [sessionQuery.isFetched]);

  const login = useCallback(
    async (input: {
      email: string;
      password: string;
      rememberMe?: boolean;
    }) => {
      await loginMutation.mutateAsync({
        data: {
          email: input.email,
          password: input.password,
          rememberMe: input.rememberMe === true,
        },
      });
      await queryClient.invalidateQueries({ queryKey: getAuthSessionQueryKey() });
    },
    [loginMutation, queryClient],
  );

  const logout = useCallback(async () => {
    await logoutMutation.mutateAsync();
    await queryClient.invalidateQueries({ queryKey: getAuthSessionQueryKey() });
  }, [logoutMutation, queryClient]);

  const value = useMemo(
    (): AuthContextValue => ({
      session: sessionQuery.data,
      isLoading: !bootstrapped || sessionQuery.isLoading,
      isAuthenticated: sessionQuery.isSuccess,
      login,
      logout,
    }),
    [
      bootstrapped,
      login,
      logout,
      sessionQuery.data,
      sessionQuery.isLoading,
      sessionQuery.isSuccess,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
