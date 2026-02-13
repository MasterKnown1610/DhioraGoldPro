import { useMemo } from 'react';
import { AuthState } from './auth/state';
import { ShopsState } from './shops/state';
import { UsersState } from './users/state';
import { HelpState } from './help/state';
import { useThemeState } from './theme/state';

const useCombineState = () => {
  const auth = AuthState();
  const shops = ShopsState();
  const users = UsersState();
  const help = HelpState();
  const theme = useThemeState();

  return useMemo(
    () => ({
      auth,
      shops,
      users,
      help,
      theme,
    }),
    [auth, shops, users, help, theme],
  );
};

export default useCombineState;
