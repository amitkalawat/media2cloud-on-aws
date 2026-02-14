import { useCallback } from 'react';
import { useAuthStore } from '@/stores/authStore';
import {
  signIn as cognitoSignIn,
  signOut as cognitoSignOut,
  refreshSession,
  getCredentials,
  getUserGroups,
  completeNewPassword as cognitoCompleteNewPassword,
  forgotPassword as cognitoForgotPassword,
  confirmForgotPassword as cognitoConfirmForgotPassword,
  startRefreshTimer,
  type AuthTokens,
  type ChallengeResponse,
} from '@/lib/cognito';

function decodeJwtPayload(token: string): Record<string, any> {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return {};
  }
}

export function useAuth() {
  const store = useAuthStore();

  const setUserFromTokens = useCallback(async (tokens: AuthTokens) => {
    const payload = decodeJwtPayload(tokens.idToken);
    const groups = getUserGroups(tokens.idToken);
    const credentials = await getCredentials(tokens.idToken);

    store.setUser({
      username: payload['cognito:username'] || payload.sub,
      email: payload.email || '',
      groups,
    });
    store.setTokens(tokens.idToken, tokens.refreshToken);
    store.setCredentials(credentials);

    startRefreshTimer(tokens.expiresIn, tokens.refreshToken, (newTokens, newCreds) => {
      store.setTokens(newTokens.idToken, newTokens.refreshToken);
      store.setCredentials(newCreds);
    });
  }, [store]);

  const signIn = useCallback(async (
    username: string,
    password: string
  ): Promise<ChallengeResponse | null> => {
    const result = await cognitoSignIn(username, password);

    if ('challengeName' in result) {
      return result;
    }

    await setUserFromTokens(result);
    return null;
  }, [setUserFromTokens]);

  const completeNewPassword = useCallback(async (
    username: string,
    newPassword: string,
    session: string
  ) => {
    const tokens = await cognitoCompleteNewPassword(username, newPassword, session);
    await setUserFromTokens(tokens);
  }, [setUserFromTokens]);

  const forgotPassword = useCallback(async (username: string) => {
    await cognitoForgotPassword(username);
  }, []);

  const confirmForgotPassword = useCallback(async (
    username: string,
    code: string,
    newPassword: string
  ) => {
    await cognitoConfirmForgotPassword(username, code, newPassword);
  }, []);

  const signOut = useCallback(async () => {
    cognitoSignOut();
    store.logout();
  }, [store]);

  const tryAutoSignIn = useCallback(async () => {
    store.setLoading(true);
    try {
      const username = localStorage.getItem('cognito.username');
      const refreshToken = localStorage.getItem('cognito.refreshtoken');

      if (!username || !refreshToken) {
        store.setLoading(false);
        return false;
      }

      const tokens = await refreshSession(refreshToken);
      await setUserFromTokens({ ...tokens, refreshToken });
      store.setLoading(false);
      return true;
    } catch {
      localStorage.removeItem('cognito.username');
      localStorage.removeItem('cognito.refreshtoken');
      store.setLoading(false);
      return false;
    }
  }, [store, setUserFromTokens]);

  return {
    ...store,
    signIn,
    signOut,
    tryAutoSignIn,
    completeNewPassword,
    forgotPassword,
    confirmForgotPassword,
  };
}
