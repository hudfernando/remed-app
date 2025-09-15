'use server'

import {z} from 'zod'
import {cookies} from 'next/headers'


const signInSchema = z.object({
    cnpj: z.string().min(14, { message: "O CNPJ precisa ter 14 digitos"}).max(14, { message: "O CNPJ precisa ter 14 digitos"})
})

export async function signIn(data : FormData){
    const result = signInSchema.safeParse(Object.fromEntries(data))
    if(!result.success){
        const errors = result.error.flatten().fieldErrors
        return {success: false, message: null, errors }
        
    }

    const {cnpj} = result.data

    //await new Promise((resolve) => setTimeout(resolve, 2000))

    const cookieStore = await cookies()
    cookieStore.set({
        name: 'cnpj', 
        value : cnpj,
        path: '/'
    
    })

    return {success: true, message: null, errors : null }
}