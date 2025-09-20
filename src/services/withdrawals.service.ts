export const newWithdraw = async (amount: number, method: string, reference: string) => {
  return await fetch(`/api/withdrawals`, {
    method: 'POST',
    body: JSON.stringify({
      amount,
      method,
      reference,
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  }).then((r) => r.json())
}
