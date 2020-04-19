import React, {useState, useEffect, useCallback} from 'react'
import axios from 'axios'


const Fib = () => {

  const [seenIndexes, setSeenIndexes] = useState([])
  const [values, setValues] = useState({})
  const [index, setIndex] = useState('')
  
  const fetchValues = useCallback(async () => {
    const values = await axios.get('/api/values/current')
    setValues(values.data || {})
  }, [])
  const fetchIndexes = useCallback(async () => {
    const seenIndexes = await axios.get('/api/values/all')
    setSeenIndexes(seenIndexes.data || [])
  }, [])

  const handleSubmit = useCallback(async (evt) => {
    evt.preventDefault()
    await axios.post('/api/values', {
      index
    })
    setIndex('')
  }, [index])

  useEffect(() => {
    fetchValues()
    fetchIndexes()
  }, [fetchValues, fetchIndexes])


  return <div>
    <form onSubmit={handleSubmit}>
      <label>Enter your index</label>
      <input value={index} onChange={evt => setIndex(evt.target.value)}/>
      <button>Submit</button>
    </form>
    <h3>Indexes I have seen:</h3>
    {seenIndexes.map(({number}) => number).join(', ')}

    <h3>Calculated Values:</h3>
    {Object.keys(values).map(key => <div key={key}>For index {key} I calculated {values[key]}</div>)}
  </div>
}


export default Fib