import React from 'react'
import { Provider } from 'react-redux'
import store from './redux'

const Root = () => {
  return <Provider store={store}></Provider>
}

export default Root
