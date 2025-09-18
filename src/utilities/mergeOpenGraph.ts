import type { Metadata } from 'next'
import { getServerSideURL } from './getURL'

const defaultOpenGraph: Metadata['openGraph'] = {
  type: 'website',
  description:
    'Posiciónate y gana de todas las personas que disfrutarán del servicio a nivel internacional',
  images: [
    {
      url: `https://storage.cloud.google.com/win2win-471320/qrs/WhatsApp%20Image%202025-09-18%20at%2017.49.52.jpeg`,
    },
  ],
  siteName: 'Win to wins',
  title: 'Win to wins',
}

export const mergeOpenGraph = (og?: Metadata['openGraph']): Metadata['openGraph'] => {
  return {
    ...defaultOpenGraph,
    ...og,
    images: og?.images ? og.images : defaultOpenGraph.images,
  }
}
