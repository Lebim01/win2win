import { FieldAccess } from 'payload'

export const owner: FieldAccess = (req) => {
  return req.id == req.data?.id
}
