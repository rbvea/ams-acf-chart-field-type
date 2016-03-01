import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import { reducer as formReducer } from 'redux-form';
import { app } from './app';
import { items } from './items';

const rootReducer = combineReducers({
  form: formReducer,
  routing: routerReducer,
  app
});

export default rootReducer;
