import useConnect from './hooks/useConnect.js'
import {useState, useEffect, useRef} from 'react'
import Hoge from './components/hoge'

const useInterval = (callback, duration) => {
  const callbackRef = useRef(callback)
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    const elapsed = () => { callbackRef.current() }
    const interval = setInterval(elapsed, duration)
    return () => clearInterval(interval)
  }, [])
}

function App() {
  const [socket, connecting, error]  = useConnect()
  const [text, setText] = useState('')
  const mousePosition = useRef({x: 0, y: 0})
  const previousMousePosition = useRef({x: 0, y: 0})

  const [message, setMessage] = useState([])
  const [friendMousePosition, setFriendMousePosition] = useState({x: 0, y: 0})

  useInterval(() => {
    console.log('interval', previousMousePosition.current.x, mousePosition.current.x)
    if(previousMousePosition.current.x !== mousePosition.current.x || previousMousePosition.current.y !== mousePosition.current.y) {
      socket?.send(JSON.stringify({type: 'mouse', ...mousePosition.current}))  
      previousMousePosition.current = mousePosition.current
    }
  }, 50)

  if(connecting) {
    return "connecting"
  }

  if(error) {
    return "error"
  }

  socket.onmessage = (e) => {
    const data = JSON.parse(e.data)

    switch(data.type) {
      case 'message':
        setMessage([...message, data.message])
        break
      case 'mouse':
        setFriendMousePosition({x: data.x, y: data.y})
        break
    }
  }

  const handleClick = () => {
    if(text.length === 0) return
    const data = {type: 'message', message: text}
    socket.send(JSON.stringify(data))
    setText('')
  }

  const handleMouseMove = (e) => {
    console.log(e.clientX, e.clientY, e.timeStamp)
    mousePosition.current = {x: e.clientX, y: e.clientY, timeStamp: e.timeStamp}
  }

  return (
    <>
      <main onPointerMove={(e) => handleMouseMove(e)} style={{minHeight: '100vh'}}>
        <Hoge />
        <div style={{position: 'fixed', top: friendMousePosition.y, left: friendMousePosition.x}}>
          <img src='./vite.svg' />
        </div>
        { message.map((m, i) => {
          return <div key={i}>{m}</div>
        })}
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder='new message' />
        <button onClick={handleClick}>send</button>
      </main>
    </>
  )
}

export default App
