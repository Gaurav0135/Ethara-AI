import { useAuth } from '../context/AuthContext'
import { FiLogOut, FiUser } from 'react-icons/fi'

const Navbar = () => {
  const { user, logout } = useAuth()

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 h-16 flex items-center justify-between px-6">
      <div className="font-semibold text-xl text-slate-800">
        Team Task Manager
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <FiUser className="w-4 h-4" />
          <span>
            {user?.name} ({user?.role})
          </span>
        </div>
        <button
          onClick={logout}
          className="p-2 text-slate-400 hover:text-red-500 transition-colors"
          title="Logout"
        >
          <FiLogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  )
}

export default Navbar
