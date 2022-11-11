import { CONTENTSTACK_HOST, HOST } from "../hooks/oauth/constants";

import axios from "axios";

export default axios.create({
  baseURL: HOST,
});

export const axiosPrivate = axios.create({
  baseURL: HOST,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

export const contentstackAxios = axios.create({
  baseURL: CONTENTSTACK_HOST,
  headers: { "Content-Type": "application/json" },
});
