import { initialState } from './state';
import { AuthActions } from './action';

const authHandlers = {
  [AuthActions.SET_USER]: (state, action) => ({
    ...state,
    user: action.payload ?? null,
  }),
  [AuthActions.SET_TOKEN]: (state, action) => ({
    ...state,
    token: action.payload ?? null,
  }),
  [AuthActions.SET_LOADING]: (state, action) => ({
    ...state,
    loading: action.payload ?? false,
  }),
  [AuthActions.SET_ERROR]: (state, action) => ({
    ...state,
    error: action.payload ?? null,
  }),
  [AuthActions.LOGOUT]: () => ({
    ...initialState,
  }),
};

const Reducer = (state, action) => {
  const handler = authHandlers[action.type];
  return handler ? handler(state, action) : state;
};

export default Reducer;
