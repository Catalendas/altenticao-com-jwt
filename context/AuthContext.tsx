import Router from "next/router";
import { createContext, ReactNode, useEffect, useState } from "react";
import { api } from "../services/api";
import { setCookie, parseCookies } from 'nookies'

type SignInCredentials = {
    email: string
    password: string
}

type User = {
    email: string
    permissions: string[]
    roles: string[]
}

type AuthContextData = {
    signIn(credentials: SignInCredentials): Promise<void>
    user: User
    isAuthenticated: boolean
}

type AuthProviderProps = {
    children: ReactNode 
}


export const AuthContext = createContext({} as AuthContextData)

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User>()
    const isAuthenticated = !!user

    useEffect(() => {
        const { 'nextauth.token': token } = parseCookies()

        if(token) {
            api.get('/me').then(response => {
                const {email, permissions, roles} = response.data

                setUser({email, permissions, roles})
            })
        }
    }, [])

    async function signIn({email, password}: SignInCredentials) {
        try {
            const response = await api.post('sessions', {
                email,
                password
            })

            const {roles, permissions, token, refreshToken} = response.data
    
            setCookie(undefined, 'nextauth.token', token, {
                maxAge: 60 * 60 * 24 * 30, // 30 dias
                path: '/'
            })
            setCookie(undefined, 'nextauth.refreshtoken', refreshToken, {
                maxAge: 60 * 60 * 24 * 30, // 30 dias
                path: '/'
            })

            setUser({
                email,
                roles,
                permissions
            })

            api.defaults.headers['Authorization'] = `Bearer ${token}`

            Router.push('/dashboard')
        }catch(err) {
            console.log(err)
        }
    }
    
    return(
        <AuthContext.Provider value={{signIn, isAuthenticated, user }}>
            {children}
        </AuthContext.Provider>
    )
}