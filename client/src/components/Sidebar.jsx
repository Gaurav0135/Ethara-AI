import { NavLink } from 'react-router-dom'
import { FiGrid, FiFolder, FiCheckSquare, FiUsers } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'

const Sidebar = () => {
  const { user } = useAuth()
  
  const links = [
    { name: 'Dashboard', path: '/', icon: FiGrid },
    { name: 'Projects', path: '/projects', icon: FiFolder },
    { name: 'Tasks', path: '/tasks', icon: FiCheckSquare },
  ]

  if (user?.role === 'Admin') {
    links.push({ name: 'Members', path: '/members', icon: FiUsers })
  }

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-full transition-all duration-300">
      <div className="h-16 flex items-center justify-center border-b border-slate-800">
        <h1 className="text-xl font-bold text-white tracking-wide">
          <span className="text-blue-500">Task</span>Manager
        </h1>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2">
        {links.map((link) => (
          <NavLink
            key={link.name}
            to={link.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-blue-600/20 text-blue-400 font-medium'
                  : 'hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <link.icon className="w-5 h-5" />
            <span>{link.name}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}

export default Sidebar
