"use client";

import { useState, useEffect } from "react";
import {
  Moon,
  Sun,
  Home,
  User,
  Ticket,
  History,
  Settings,
  LogOut,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ThemeProvider, useTheme } from "next-themes";

export function TicketManagement() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ticketsPerPage = 4;
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);



  useEffect(() => {
    setMounted(true);
    document.body.style.setProperty("--color-primary", "#1A1C23");
    document.body.style.setProperty("--color-secondary", "#C19E7B");
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const themeIcon = mounted ? (
    theme === "dark" ? (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-6 h-6 transition duration-300 ease-in-out transform hover:rotate-180"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 3v1.5M12 19.5V21M4.219 4.219l1.061 1.061M17.719 17.719l1.061 1.061M3 12h1.5M19.5 12H21M4.219 19.781l1.061-1.061M17.719 6.281l1.061-1.061M12 9a3 3 0 100 6 3 3 0 000-6z"
        />
      </svg>
    ) : (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-6 h-6 transition duration-300 ease-in-out transform hover:rotate-180"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21.752 15.002A9.718 9.718 0 0112.003 21c-5.385 0-9.75-4.365-9.75-9.75 0-4.207 2.663-7.793 6.423-9.126.45-.164.938.086 1.06.55a.749.749 0 01-.347.826 8.251 8.251 0 1010.965 10.965.75.75 0 01.826-.347c.464.122.714.61.55 1.06z"
        />
      </svg>
    )
  ) : null;

  // Coded Added by Seif to Connect Backend with Frontend (DON'T MODIFY PLEASE.)
  const [tickets, setTickets] = useState([]);
  const [error, setError] = useState("");

  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
    return null;
  }

  useEffect(() => {
    const fetchTickets = async () => {
      const accessToken = getCookie("accessToken");
      if (!accessToken) {
        setError("No access token found. Please log in.");
        return;
      }

      try {
        const response = await fetch("http://127.0.0.1:5000/api/v1/tickets", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        const data = await response.json();
        if (data.status === "Success") {
          setTickets(data.data.tickets);
        } else {
          setError("Failed to fetch tickets");
        }
      } catch (error) {
        setError("An error occurred while fetching tickets.");
      }
    };

    fetchTickets();
  }, []);

  if (error) return <div className="error">{error}</div>;

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-Primary dark:bg-Primary text-neutral-200 p-4 transition-all duration-300 ease-in-out z-10 flex flex-col ${
          isExpanded ? "w-[300px]" : "w-[72px]"
        }`}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        <div className="flex items-center mb-8">
          <Link href={"/Profile"} className="flex items-center">
            <img
              src="/Sidebar-icon.jpg"
              alt="Admin"
              className="w-10 h-10 rounded-full mr-3"
            />
            {isExpanded && <span className="text-xl font-semibold">Admin</span>}
          </Link>
        </div>
        <nav className="flex-grow">
          <SidebarItem
            icon={<Home size={20} />}
            label="Home"
            href="/"
            isExpanded={isExpanded}
          />
          <SidebarItem
            icon={<History size={20} />}
            label="History"
            href="/ticket-history"
            isExpanded={isExpanded}
          />
          <SidebarItem
            icon={<LogOut size={20} />}
            label="Log out"
            href="#"
            isExpanded={isExpanded}
          />
        </nav>
        <button
          onClick={toggleTheme}
          className={`mt-auto w-full py-2 flex items-center bg-Primary text-white hover:bg-opacity-80 transition-colors duration-300 rounded ${
            isExpanded ? "text-left" : "text-center"
          }`}
        >
          {themeIcon}
          {isExpanded && (
            <span className="ml-2">
              {theme === "dark" ? "Light Mode" : "Dark Mode"}
            </span>
          )}
        </button>
      </aside>

      {/* Main content */}
      <main
        className={`flex-1 p-8 bg-neutral-100 dark:bg-slate-950 overflow-auto transition-all duration-300 ease-in-out ${
          isExpanded ? "ml-[300px]" : "ml-[72px]"
        }`}
      >
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-Primary dark:text-neutral-100">
            My tickets :
          </h1>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="space-y-4">
                {tickets.map((ticket) => (
                  <TicketItem key={ticket._id} ticket={ticket} />
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
          <Link href="/user-ticket">
            <button className="mt-6 px-4 py-2 dark:bg-Primary bg-neutral-100 dark:text-neutral-200 text-Primary hover:bg-Primary hover:text-white rounded transition-colors dark:hover:bg-neutral-200 dark:hover:text-[#1A1C23] duration-300">
              Submit another ticket
            </button>
          </Link>
        </div>
      </main>

      {/* Navigation arrows */}
      <div className="fixed bottom-4 right-4 flex flex-col items-center space-y-2">
        <button
          className="p-2 rounded-full bg-Primary text-neutral-200"
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          <ChevronUp size={24} />
        </button>
        <button
          className="p-2 rounded-full bg-Primary text-neutral-200"
          onClick={() =>
            setCurrentPage((prev) =>
              Math.min(prev + 1, Math.ceil(tickets.length / ticketsPerPage))
            )
          }
          disabled={currentPage === Math.ceil(tickets.length / ticketsPerPage)}
        >
          <ChevronDown size={24} />
        </button>
      </div>
    </div>
  );
}

function SidebarItem({
  icon,
  label,
  href,
  isExpanded,
}: {
  icon: React.ReactNode;
  label: string;
  href: string;
  isExpanded: boolean;
}) {
  return (
    <a
      href={href}
      className="flex items-center mb-4 dark:text-neutral-200  hover:text-white cursor-pointer transition-colors duration-300"
    >
      <div className="w-8">{icon}</div>
      <span
        className={`ml-2 ${
          isExpanded ? "opacity-100" : "opacity-0 w-0"
        } transition-all duration-300`}
      >
        {label}
      </span>
    </a>
  );
}

function TicketItem({ ticket }) {
  const createdDate = new Date(ticket.createdAt).toLocaleDateString();

  return (
    <div className="p-4 rounded-lg bg-Primary">
      <div className="flex items-start space-x-4">
        <img src="/Sidebar-icon.jpg" alt={ticket.createdBy.fullName} className="w-10 h-10 rounded-full" />
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-neutral-200 dark:text-neutral-200">{ticket.title}</h3>
              <p className="text-sm text-neutral-200 opacity-80 dark:text-neutral-200 dark:opacity-80">
                Created by: {ticket.createdBy.fullName}
              </p>
              {ticket.assignedTo && (
                <p className="text-sm text-neutral-200 opacity-80 dark:text-neutral-200 dark:opacity-80">
                  Assigned to: {ticket.assignedTo.name}
                </p>
              )}
            </div>
            <span className="text-sm text-neutral-200 opacity-80 dark:text-neutral-200 dark:opacity-80 font-semibold">
              {createdDate}
            </span>
          </div>
          <p className="mt-2 text-sm text-neutral-200 opacity-90 dark:text-neutral-200 dark:opacity-90">
            {ticket.description}
          </p>
        </div>
      </div>
      <div className='flex justify-end'>
        <button className="mt-4 px-3 py-1 dark:bg-Primary dark:text-neutral-200 text-Primary bg-neutral-100 hover:dark:bg-neutral-200 hover:dark:text-neutral-950 font-semibold rounded text-sm hover:bg-opacity-80 transition-colors duration-300">
          View
        </button>
      </div>
    </div>
  );
}


export default function Page() {
  return (
    <ThemeProvider attribute="class">
      <TicketManagement />
    </ThemeProvider>
  );
}
