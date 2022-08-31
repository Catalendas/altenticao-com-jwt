import { useContext, useEffect } from "react"
import { AuthContex } from "../context/AuthContext"
import { api } from "../services/api"

export default function Deshboard() {
    const { user } = useContext(AuthContex)

    useEffect(() => {
        api.get('/me').then(response => console.log(response))
    } )

    return(
        <h1>Deshboard: {user.email}</h1>
    )
}