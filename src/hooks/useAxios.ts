import axios, { AxiosRequestConfig } from 'axios'
import { useEffect, useState } from 'react'

const useAxios = <T>(props: AxiosRequestConfig, deps: any[] = []) => {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<T | null>(null)

  const refetch = async () => {
    setLoading(true)
    await axios(props).then((r) => setData(r.data))
    setLoading(false)
  }

  useEffect(() => {
    refetch()
  }, deps)

  return {
    loading,
    data,
    refetch,
  }
}

export default useAxios
