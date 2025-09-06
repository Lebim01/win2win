export const changePassword = async (oldpassword: string, newpassword: string) => {
  return await fetch(`/api/profile/change-password`, {
    method: 'POST',
    body: JSON.stringify({
      password: newpassword,
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  }).then((r) => r.json())
}
