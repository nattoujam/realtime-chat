import { useEffect, useState, useRef } from 'react'
import * as Websocket from 'websocket'

class WSClient {
  static getInstance() {
    if(this.instance === undefined) {
      this.instance = new Websocket.w3cwebsocket('ws://localhost:8000/ws')
    }
    return this.instance
  }
}

const useConnect = () => {
  const socketRef = useRef()
  const [connecting, setConnecting] = useState(true)
  const [error, setError] = useState(false)

  const connect = () => {
    return new Promise((resolve, reject) => {
      console.log('connecting...')
      
      socketRef.current = WSClient.getInstance()
      
      socketRef.current.onopen = () => {
        console.log('connected')
        resolve()
      }

      socketRef.current.onclose = () => {
        console.log('reconnecting...')
        connect()
      }

      socketRef.current.onerror = (err) => {
        console.log("connection error: ", err)
        reject()
      }
    })
  }

  useEffect(() => {
    if(socketRef.current === undefined) {
      connect()
        .then(() => {
          setConnecting(false)
        })
        .catch(() => {
          setError(true)
        })
    }
  }, [])

  return [ socketRef.current, connecting, error ]
}

export default useConnect
