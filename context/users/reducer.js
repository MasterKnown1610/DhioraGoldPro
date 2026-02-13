import { initialState } from './state';
import { UsersActions } from './action';

const usersHandlers = {
  [UsersActions.SET_USERS]: (state, action) => ({
    ...state,
    users: Array.isArray(action.payload) ? action.payload : [],
  }),
  [UsersActions.SET_SINGLE_USER]: (state, action) => ({
    ...state,
    singleUser: action.payload ?? null,
  }),
  [UsersActions.SET_PAGINATION]: (state, action) => ({
    ...state,
    pagination: action.payload ?? null,
  }),
  [UsersActions.SET_LOADING]: (state, action) => ({
    ...state,
    loading: action.payload ?? false,
  }),
  [UsersActions.SET_ERROR]: (state, action) => ({
    ...state,
    error: action.payload ?? null,
  }),
};

const Reducer = (state, action) => {
  const handler = usersHandlers[action.type];
  return handler ? handler(state, action) : state;
};

export default Reducer;
