
import {useEffect, useRef} from 'react'

const useInterval = (callback, duration) => {
  const callbackRef = useRef(callback)
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    const elapsed = () => { callbackRef.current() }
    const interval = setInterval(elapsed, duration)
    return () => clearInterval(interval)
  }, [duration])
}

export default useInterval