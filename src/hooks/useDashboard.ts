import { Media } from '@/payload-types'
import useAxios from './useAxios'

type DashboardResponse = {
  images: {
    id: number
    image: Media
  }[]
}

export const useDashboard = () => {
  const { data } = useAxios({
    url: '/api/dashboard',
  })
  return data as DashboardResponse
}
