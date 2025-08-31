import { FC, ReactNode } from 'react'
import { FaUser } from 'react-icons/fa'

type Props = {
  title: string
  value: ReactNode
}

const Indicator: FC<Props> = ({ title, value }) => {
  return (
    <div className="w-full p-6 rounded-lg shadow-sm bg-gray-800 border-gray-700 flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <FaUser size={20} />
        <span className="text-2xl font-semibold text-white tracking-tight">{title}</span>
      </div>

      <div>
        <span className="mb-3 font-normal text-white text-3xl font-extrabold tracking-wider">
          {value}
        </span>
      </div>
    </div>
  )
}

export default Indicator
