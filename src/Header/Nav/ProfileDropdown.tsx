import { logout } from '@/services/auth.service'
import { Avatar, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from '@heroui/react'
import { useRouter } from 'next/navigation'

const ProfileDropdown = () => {
  const router = useRouter()

  const _logout = async () => {
    await logout()
    router.replace('/sign-in')
  }

  return (
    <div>
      <Dropdown>
        <DropdownTrigger>
          <Avatar name="Root" src="" className="hover:cursor-pointer" isBordered />
        </DropdownTrigger>
        <DropdownMenu aria-label="Static Actions">
          <DropdownItem key="new" href="/profile">
            Perfil
          </DropdownItem>

          <DropdownItem key="referrals" href="/referrals">
            Referidos
          </DropdownItem>

          <DropdownItem key="wallet" href="/wallet">
            Billetera
          </DropdownItem>

          <DropdownItem key="delete" className="text-danger" color="danger" onPress={_logout}>
            Cerrar Sesión
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </div>
  )
}

export default ProfileDropdown
