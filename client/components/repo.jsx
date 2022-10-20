import React from 'react'
import { useParams } from 'react-router-dom'

import Head from './head'



const Repo = () => {
const {userName} = useParams()
return(
  <div>
    <Head title="Hello" />
   {userName}
  </div>
)
}

Repo.propTypes = {}

export default React.memo(Repo)