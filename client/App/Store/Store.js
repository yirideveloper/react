import { createStore, applyMiddleware } from 'redux'
import Config from '../Config/Config'
import createLogger from 'redux-logger'
import rootReducer from '../Reducers/'
import sagaMiddleware from 'redux-saga'
import sagas from '../Sagas/'
import R from 'ramda'
import reactotron from '../../reactotron/client'

// the logger master switch
const USE_LOGGING = Config.sagas.logging
// silence these saga-based messages
const SAGA_LOGGING_BLACKLIST = ['EFFECT_TRIGGERED', 'EFFECT_RESOLVED', 'EFFECT_REJECTED']
// creat the logger
const logger = createLogger({
  predicate: (getState, { type }) => USE_LOGGING && R.not(R.contains(type, SAGA_LOGGING_BLACKLIST)),
  stateTransformer: (state) => R.map((v) => v.asMutable({deep: true}), state)
})

// a function which can create our store and auto-persist the data
export default () => {
  const store = createStore(
    rootReducer,
    applyMiddleware(
      logger,
      reactotron.reduxMiddleware,
      sagaMiddleware(...sagas)
    )
  )

  reactotron.addReduxStore(store)

  return store
}
