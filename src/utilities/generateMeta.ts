import type { Metadata } from 'next'

import type { Media, Page, Config } from '../payload-types'

import { mergeOpenGraph } from './mergeOpenGraph'
import { getServerSideURL } from './getURL'

const getImageURL = (image?: Media | Config['db']['defaultIDType'] | null) => {
  const serverUrl = getServerSideURL()

  let url = serverUrl + '/website-template-OG.webp'

  if (image && typeof image === 'object' && 'url' in image) {
    const ogUrl = image.sizes?.og?.url

    url = ogUrl ? serverUrl + ogUrl : serverUrl + image.url
  }

  return url
}

export const generateMeta = async (args: { doc: Partial<Page> | null }): Promise<Metadata> => {
  const ogImage =
    'https://static.readdy.ai/image/da204f4dc2e247fc653978545687da45/b09161570655f243310fa8a39e48e6dd.jfif'
  const title = 'Win2Win'

  return {
    description:
      'Únete a la revolución digital y de entrenamiento. POSICIÓNATE Y GANA DE TODAS LAS PERSONAS QUE DISFRUTARÁN DEL SERVICIO A NIVEL INTERNACIONAL',
    openGraph: mergeOpenGraph({
      description:
        'Únete a la revolución digital y de entrenamiento. POSICIÓNATE Y GANA DE TODAS LAS PERSONAS QUE DISFRUTARÁN DEL SERVICIO A NIVEL INTERNACIONAL',
      images: ogImage
        ? [
            {
              url: ogImage,
            },
          ]
        : undefined,
      title,
    }),
    title,
  }
}
