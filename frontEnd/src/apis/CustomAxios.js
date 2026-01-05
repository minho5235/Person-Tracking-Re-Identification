import axios from 'axios';
import { getCookie } from './apis_Cookie';

const BASE_URL = 'http://10.101.118.108:8000'

let client = null;

if(getCookie("ACCESS_TOKEN"))
{
  client = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
    headers: {
      "Content-Type": "application/json"
    }
  });
}
else
{
  client = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json"
    }
  })
}

export {client}