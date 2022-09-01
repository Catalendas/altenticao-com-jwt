import { useContext, useEffect } from "react"
import { AuthContext } from "../context/AuthContext"
import { api } from "../services/api"

export default function Deshboard() {
    const { user } = useContext(AuthContext)

    useEffect(() => {
        api.get('/me').then(response => console.log(response))
    } )

    return(
        <h1>Deshboard: {user?.email}</h1>
    )
}