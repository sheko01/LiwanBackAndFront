'use client'

import { useState, useEffect } from 'react'
import { Moon, Sun, Home, History, ChevronUp, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ThemeProvider, useTheme } from 'next-themes'
import { SidebarDemo } from '../user-main/page'

const tickets = [
  { id: 1, user: 'Test user', title: 'IT Support', description: 'Description Description Description Description Description Description', date: '19/10/2024', department: 'IT department' },
  { id: 2, user: 'Test user', title: 'User account', description: 'Description Description Description Description Description Description', date: '19/10/2024', department: 'Human Resources' },
]

export function TicketManagement() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const ticketsPerPage = 4
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  const indexOfLastTicket = currentPage * ticketsPerPage
  const indexOfFirstTicket = indexOfLastTicket - ticketsPerPage
  const currentTickets = tickets.slice(indexOfFirstTicket, indexOfLastTicket)

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <div className="flex h-screen bg-Primary text-neutral-200"> 
      {/* Sidebar */}
      <aside 
        className={`fixed top-0 left-0 h-full bg-Primary text-neutral-200 transition-all duration-300 ease-in-out z-10 flex flex-col ${isExpanded ? 'w-[300px]' : 'w-[72px]'}`}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        <div className="flex items-center p-4 mb-8">
            <Link href={"/Profile"} className='flex items-center'>
            <img src="/Sidebar-icon.jpg" alt="Admin" className="w-10 h-10 rounded-full mr-3" />
            {isExpanded && <span className="text-xl font-semibold">Admin</span>}
            </Link>
        </div>
        <nav className="flex-grow">
          <SidebarItem icon={<Home size={20} />} label="Home" href="/" isExpanded={isExpanded} />
          <SidebarItem icon={<History size={20} />} label="History" href="#" isExpanded={isExpanded} />
        </nav>
        <button
          onClick={toggleTheme}
          className={`mt-auto w-full py-4 flex items-center justify-center bg-primary-foreground text-primary hover:bg-slate-200 hover:text-Primary rounded-sm transition-colors duration-300`}
        >
          {mounted && theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          {isExpanded && <span className="ml-2">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>
      </aside>

      {/* Main content */}
      <main className={`flex-1 p-8 overflow-auto dark:bg-neutral-950 bg-neutral-200 text-Primary dark:text-neutral-200 transition-all duration-300 ease-in-out ${isExpanded ? 'ml-[300px]' : 'ml-[60px]'}`}>
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">
            History
          </h1>
          <div className="mb-4">
            <select className="p-2 rounded bg-Primary text-neutral-200">
              <option>Sort by</option>
              <option>Creation date</option>
              <option>Response date</option>
              <option>Alphabetical</option>
              <option>Assigned to</option>
            </select>
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="space-y-4">
                {currentTickets.map((ticket) => (
                  <TicketItem key={ticket.id} ticket={ticket} /> 
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Navigation arrows */}
      <div className="fixed bottom-4 right-4 flex flex-col items-center space-y-2">
        <button 
          className="p-2 rounded-full bg-primary text-Primary dark:text-neutral-200"
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          <ChevronUp size={24} />
        </button>
        <button 
          className="p-2 rounded-full bg-primary text-Primary dark:text-neutral-200"
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(tickets.length / ticketsPerPage)))}
          disabled={currentPage === Math.ceil(tickets.length / ticketsPerPage)}
        >
          <ChevronDown size={24} />
        </button>
      </div>
    </div>
  )
}

function SidebarItem({ icon, label, href, isExpanded }: { icon: React.ReactNode; label: string; href: string; isExpanded: boolean }) {
  return (
    <Link href={href} className="flex items-center mb-4 hover:text-white cursor-pointer transition-colors duration-300 px-4 py-2">
      <div className="w-8">{icon}</div>
      <span className={`ml-2 ${isExpanded ? 'opacity-100' : 'opacity-0 w-0'} transition-all duration-300`}>{label}</span>
    </Link>
  )
}

function TicketItem({ ticket }: { ticket: any }) {
  return (
    <div className="p-4 rounded-lg bg-Primary text-neutral-200"> 
      <div className="flex items-start space-x-4">
        <img src="/Sidebar-icon.jpg" alt={ticket.user} className="w-10 h-10 rounded-full" />
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold">{ticket.title}</h3>
              <p className="text-sm opacity-80">{ticket.user}</p>
            </div>
            <span className="text-sm opacity-80 font-semibold">{ticket.date}</span>
          </div>
          <p className="mt-2 text-sm">{ticket.description}</p>
          <p className="mt-1 text-sm">Submitted to: {ticket.department}</p>
        </div>
      </div>
      <div className='flex justify-end'>
        <button className="mt-4 px-3 py-1 bg-primary-foreground text-neutral-200 hover:text-Primary hover:bg-neutral-200 font-semibold rounded text-sm transition-colors duration-300">
          View
        </button>
      </div>
    </div>
  )
}

export default function TicketHistory() {
  return (
        <ThemeProvider attribute='class'>
            <TicketManagement />
        </ThemeProvider>
  )
}