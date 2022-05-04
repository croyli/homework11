import React, { useState } from 'react'
import Head from './head'

import { history } from '../redux'

const Home = () => {
  const [value, setValue] = useState('')

  const onChange = (e) => {
    setValue(e.target.value)
    console.log(value)
  }

  const onClick = () => {
    history.push(`/${value}`)
  }

  return (
    <div className="flex justify-center items-senter">
      <Head title="Welcome" />
      <div className="flex flex-col bg-gray-100 rounded border m-10 p-4 space-y-2">
        <input
          className="rounded p-2"
          type="text"
          id="input-field"
          onChange={onChange}
          value={value}
        />
        <button
          className="border bg-gray-300 rounded p-2"
          type="button"
          id="search-button"
          onClick = {onClick}
          >
          Приветствую тебя,чемпион людей,чемпион зверей{' '}
        </button>
      </div>
    </div>
  )
}
Home.propTypes = {}

export default Home
