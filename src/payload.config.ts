// storage-adapter-import-placeholder
import { postgresAdapter } from '@payloadcms/db-postgres'

import sharp from 'sharp' // sharp-import
import path from 'path'
import { buildConfig, PayloadRequest } from 'payload'
import { fileURLToPath } from 'url'

import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Footer } from './Footer/config'
import { Header } from './Header/config'
import { plugins } from './plugins'
import { defaultLexical } from '@/fields/defaultLexical'
import { getServerSideURL } from './utilities/getURL'
import { Admins } from './collections/Admins'
import { Customers } from './collections/Customers/index'
import { ReferralPayouts } from './collections/ReferralPayouts'
import { Coupons } from './collections/Coupons'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import { Withdrawals } from './collections/Withdrawals'
import ServiceCharges from './collections/ServiceCharges'
import Membership from './collections/Memberships'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  serverURL: process.env.VERCEL_PROJECT_PRODUCTION_URL,
  admin: {
    components: {
      Nav: '@/components/AdminSidemenu',

      views: {
        dashboard: {
          Component: '@/views/Dashboard',
          path: '/',
          exact: true,
        },
      },
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    user: Admins.slug,
    livePreview: {
      breakpoints: [
        {
          label: 'Mobile',
          name: 'mobile',
          width: 375,
          height: 667,
        },
        {
          label: 'Tablet',
          name: 'tablet',
          width: 768,
          height: 1024,
        },
        {
          label: 'Desktop',
          name: 'desktop',
          width: 1440,
          height: 900,
        },
      ],
    },
  },
  // This config helps us configure global or default features that the other editors can inherit
  editor: defaultLexical,
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
  }),
  collections: [
    Pages,
    Media,
    Admins,
    Customers,
    ReferralPayouts,
    Coupons,
    Withdrawals,
    ServiceCharges,
    Membership,
  ],
  cors: [getServerSideURL()].filter(Boolean),
  globals: [Header, Footer],
  plugins: [
    ...plugins,
    // storage-adapter-placeholder
  ],
  defaultDepth: 0,
  secret: process.env.PAYLOAD_SECRET,
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  email: nodemailerAdapter({
    defaultFromAddress: process.env.STMP_USER!,
    defaultFromName: 'win2win',
    transportOptions: {
      host: process.env.SMTP_HOST,
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    },
    skipVerify: true,
  }),
  jobs: {
    access: {
      run: ({ req }: { req: PayloadRequest }): boolean => {
        // Allow logged in users to execute this endpoint (default)
        if (req.user) return true

        // If there is no logged in user, then check
        // for the Vercel Cron secret to be present as an
        // Authorization header:
        const authHeader = req.headers.get('authorization')
        return authHeader === `Bearer ${process.env.CRON_SECRET}`
      },
    },
    tasks: [],
  },

  /*onInit: async (payload) => {
    try {
      await ensureRootAdmin(payload)
    } catch (err) {
      payload.logger.error(`Error creando admin inicial: ${(err as Error).message}`)
    }
  },*/
})
