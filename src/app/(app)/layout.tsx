import { redirect } from 'next/navigation'
import { isAuthenticated } from '@/auth/auth'
import { GlobalLoadingProvider } from '@/context/GlobalLoadingContext'
import Providers from '../provider'
import { GlobalLoadingOverlay } from '@/components/GlobalLoadingOverlay'


export default async function AppLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {

    if (! await isAuthenticated()) {
        redirect('/auth/sign-in')
    }

    return (
        <>
            <GlobalLoadingProvider>
                <Providers>
                    {children}
                    <GlobalLoadingOverlay />
                </Providers>
            </GlobalLoadingProvider>
        </>
    )
}
