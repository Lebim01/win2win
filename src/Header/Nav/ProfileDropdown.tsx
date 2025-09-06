import { Avatar, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from '@heroui/react'
import { useRouter } from 'next/navigation'

const ProfileDropdown = () => {
  const router = useRouter()

  const logout = async () => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/customers/logout?allSessions=false`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )
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

          <DropdownItem key="delete" className="text-danger" color="danger" onPress={logout}>
            Cerrar Sesión
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </div>
  )
}

export default ProfileDropdown
