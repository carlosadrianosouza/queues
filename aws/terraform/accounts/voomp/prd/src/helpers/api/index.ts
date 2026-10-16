import { configRequest, configResponseError, configResponseSuccess } from './config'
import axios from 'axios'

export const api = axios.create()

api.interceptors.request.use(configRequest)
api.interceptors.response.use(configResponseSuccess, configResponseError)
