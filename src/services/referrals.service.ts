export const getChild = async (id: number) => {
  const res = await fetch(`/api/get-child/${id}`, { credentials: 'include' })
  return await res.json()
}
