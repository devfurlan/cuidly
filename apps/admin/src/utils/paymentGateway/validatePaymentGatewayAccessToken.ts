export function validatePaymentGatewayAccessToken(req: Request): boolean {
  const accessToken = req.headers.get('asaas-access-token');
  if (accessToken !== process.env.ASAAS_ACCESS_TOKEN) {
    return true;
  }
  return false;
}
