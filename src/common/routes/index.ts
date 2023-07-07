import usersRoutes from '@/app/users/routes'
import operationRoutes from '@/app/operations/routes'
import recordRoutes from '@/app/records/routes'

export default [
  { route: '/auth', handler: usersRoutes },
  { route: '/operations', handler: operationRoutes },
  { route: '/records', handler: recordRoutes },
]