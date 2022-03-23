import React from 'react'
import Head from './head'
// import wave from '../assets/images/wave.jpg'

const Home = () => {
  return (
    <div>
      <Head title="Welcome" />
      <input type="text" id="input-field" />
      <button type="button" >Error</button>
    </div>
  )
}

Home.propTypes = {}

export default Home
