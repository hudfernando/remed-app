'use client'

import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import Image from 'next/image'

import logoHosp from '@/assets/LOGO GOYAZ HOSPITALAR.jpg.jpeg'

import {useFormState} from '@/hooks/use-form-state'
import { signIn } from './actions'
import { useRouter, useSearchParams } from 'next/navigation'




export function SignInForm() {
    const router = useRouter()
     const [{ errors}, handleSubmit, isPending] = useFormState(
    signIn,
    () => {
      router.push('/')
    },
  )

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1 flex flex-col items-center ">
                <Image src={logoHosp} alt='Logo Remed' className="mr-2 size-36" />
                <Label htmlFor="cnpj">Insira o seu CNPJ</Label>
                <Input name="cnpj" type="text" id="cnpj" />
                {errors?.cnpj && (
                    <p className='text-xs font-medium text-red-500'>{errors.cnpj[0]}</p>
                )}
            </div>
            <Button className="w-full" type="submit" disabled={isPending}>
                {isPending ? <Loader2 className="size-4 animate-spin" /> : "Entrar"}
            </Button>
            <Separator />
        </form>
    )
}