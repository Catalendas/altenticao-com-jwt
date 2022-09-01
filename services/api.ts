import { rejects } from "assert";
import axios, { AxiosError } from "axios";
import { parseCookies, setCookie } from 'nookies'

interface AxiosErrorResponse {
    code?: string;
  }
  
let cookies = parseCookies()
let isRefreshing = false
let failedRequestsQueue = []

export const api = axios.create({
    baseURL:'http://localhost:3333',
    
})

api.defaults.headers['Authorization']  = `Bearer ${cookies['nextauth.token']}`;
api.interceptors.response.use(response => {
    return response
}, (error: AxiosError<AxiosErrorResponse>) => {
    if(error.response.status == 401) {
        if(error.response.data?.code == 'token.expired') {
             cookies = parseCookies()

            const { 'nextauth.refreshToken': refreshToken } = cookies

            const originalConfig = error.config

            if(!isRefreshing) {
                isRefreshing = true

                api.post('/refresh', {
                    refreshToken,
                }).then(response => {
                    const {token} = response.data
    
                    setCookie(undefined, 'nextauth.token', token, {
                        maxAge: 60 * 60 * 24 * 30, // 30 dias
                        path: '/'
                    })
                    setCookie(undefined, 'nextauth.refreshtoken', response.data.refreshToken, {
                        maxAge: 60 * 60 * 24 * 30, // 30 dias
                        path: '/'
                    })
    
                    api.defaults.headers['Authorization'] = `Bearer ${token}`

                    failedRequestsQueue.forEach(request => request.resolve(token))
                    failedRequestsQueue = []
                    
                }).catch(error => {
                    failedRequestsQueue.forEach(request => request.rejects(error))
                    failedRequestsQueue = []
                }).finally(() => {isRefreshing = false})
            } 

            return new Promise((resolve, rejects) => {
                failedRequestsQueue.push({
                    resolve: (token: string) => {
                        originalConfig.headers['Authorization'] = `Bearer ${token}`
                        resolve(api(originalConfig))
                    } ,
                    rejects: (error: AxiosError) => {
                        rejects(error)
                    }
                })
            })
        } else {

        }
    }
})