import { createStore } from 'redux'
import createRootReducer from './reducers'

const initialState = {}

const store = createStore(createRootReducer(), initialState)

export default store
