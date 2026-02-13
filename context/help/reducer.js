import { initialState } from './state';
import { HelpActions } from './action';

const helpHandlers = {
  [HelpActions.SET_COMPLAINTS]: (state, action) => ({
    ...state,
    complaints: Array.isArray(action.payload) ? action.payload : [],
  }),
  [HelpActions.SET_PAGINATION]: (state, action) => ({
    ...state,
    pagination: action.payload ?? null,
  }),
  [HelpActions.SET_LOADING]: (state, action) => ({
    ...state,
    loading: action.payload ?? false,
  }),
  [HelpActions.SET_ERROR]: (state, action) => ({
    ...state,
    error: action.payload ?? null,
  }),
};

const Reducer = (state, action) => {
  const handler = helpHandlers[action.type];
  return handler ? handler(state, action) : state;
};

export default Reducer;
