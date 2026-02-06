import axios from 'axios';

const apiAsaas = axios.create({
  baseURL: 'https://www.asaas.com/api',
  headers: {
    'Content-Type': 'application/json',
    accept: 'application/json',
    access_token: (process.env.ASAAS_API_KEY || '').toString(),
  },
});

export default apiAsaas;
