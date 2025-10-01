import Image from 'next/image'
import remedIcon from '@/assets/logo.svg'

//import { ProfileButton } from './profile-button'
import { Separator } from './ui/separator'

export function Header() {
    return (
        <div>
            <div className="mx-auto flex max-w-[1200px] items-center justify-center">
                <div className="flex items-center gap-3">
                   <Image
                        src={remedIcon}
                        className="size-36"
                        alt="Remed"
                    />
                </div>
                {/* <div className="flex items-center gap-4">
                    <ProfileButton />
                </div> */}

            </div>
            <Separator />
        </div>


    )
}