const instanceId = process.env.ZAPI_INSTANCE_ID!;
const token = process.env.ZAPI_TOKEN!;

export const sendMessage = async (phone: string, message: string) => {
  await fetch(
    `https://api.z-api.io/instances/${instanceId}/token/${token}/send-text`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Client-Token': process.env.ZAPI_CLIENT_TOKEN!,
      },
      body: JSON.stringify({ phone, message }),
    },
  );
};
