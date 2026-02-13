import { initialState } from './state';
import { ShopsActions } from './action';

const shopsHandlers = {
  [ShopsActions.SET_SHOPS]: (state, action) => ({
    ...state,
    shops: Array.isArray(action.payload) ? action.payload : [],
  }),
  [ShopsActions.SET_SINGLE_SHOP]: (state, action) => ({
    ...state,
    singleShop: action.payload ?? null,
  }),
  [ShopsActions.SET_PAGINATION]: (state, action) => ({
    ...state,
    pagination: action.payload ?? null,
  }),
  [ShopsActions.SET_LOADING]: (state, action) => ({
    ...state,
    loading: action.payload ?? false,
  }),
  [ShopsActions.SET_ERROR]: (state, action) => ({
    ...state,
    error: action.payload ?? null,
  }),
};

const Reducer = (state, action) => {
  const handler = shopsHandlers[action.type];
  return handler ? handler(state, action) : state;
};

export default Reducer;
