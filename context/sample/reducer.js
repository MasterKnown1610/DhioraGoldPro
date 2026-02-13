import {initialState} from './State';

const categoriesHandlers = {
  SET_TRAINER: (state, action) => ({
    ...state,
    trainer: action.payload ?? null,
  }),
  SET_TRAINERS: (state, action) => ({
    ...state,
    trainers: Array.isArray(action.payload) ? action.payload : [],
  }),
};

const  Reducer = (state, action) => {
  const handler= categoriesHandlers[action.type];
  return handler ? handler(state, action) : state;
};

export default Reducer;
