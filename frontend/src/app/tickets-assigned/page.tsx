"use client";
import { useState, useEffect, SetStateAction } from "react";
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
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ThemeProvider, useTheme } from "next-themes";
import { GrDashboard } from "react-icons/gr";
import { IconDashboard, IconLayoutDashboard } from "@tabler/icons-react";
import { useRouter } from "next/navigation"; // Add this import

export function TicketManagement() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const router = useRouter(); // Initialize router here

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
      <Sun className="w-6 h-6 transition duration-300 ease-in-out transform hover:rotate-180" />
    ) : (
      <Moon className="w-6 h-6 transition duration-300 ease-in-out transform hover:rotate-180" />
    )
  ) : null;



  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setSelectedTicket(null);
  };

  // SEIF'S CODE TO CONNECT BACKEND WITH FRONTEND

  const decodeTokenPayload = (token) => {
    try {
      const base64Payload = token.split(".")[1];
      const decodedPayload = atob(base64Payload);
      return JSON.parse(decodedPayload);
    } catch (error) {
      console.error("Failed to decode token payload:", error);
      return null;
    }
  };

  const [employeeData, setEmployeeData] = useState(null);
  const [ticketsData, setTicketsData] = useState([]);
  const [viewedTicket, setViewedTicket] = useState(null);
  const [showPending, setShowPending] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);

  // Function to filter tickets based on status
  const filterTickets = () => {
    if (showPending) return ticketsData.filter(ticket => ticket.status === "pending");
    if (showCompleted) return ticketsData.filter(ticket => ticket.status === "completed");
    return ticketsData; // Show all tickets by default
  };

  const handleViewTicket = (ticket) => {
    setViewedTicket(ticket);
  };

  useEffect(() => {
    const accessToken = document.cookie
      .split("; ")
      .find((row) => row.startsWith("accessToken"))
      ?.split("=")[1];

    if (accessToken) {
      const payload = decodeTokenPayload(accessToken);
      const employeeId = payload?.id;

      if (employeeId) {
        fetch("http://127.0.0.1:5000/api/v1/employees/", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
          .then((response) => response.json())
          .then((data) => {
            const employees = data?.data?.employees || [];
            const employee = employees.find((emp) => emp._id === employeeId);

            if (employee) {
              setEmployeeData(employee);
              const managedDepartments = employee.departmentsManaged; // Get the departments managed by the employee

              // Fetch tickets for each managed department concurrently
              const fetchDepartmentTickets = async (deptId) => {
                try {
                  const response = await fetch(`http://127.0.0.1:5000/api/v1/departments/${deptId}`, {
                    headers: {
                      Authorization: `Bearer ${accessToken}`,
                    },
                  });
                  const departmentData = await response.json();
                  const departmentTickets = departmentData.data.department.tickets || [];
                  setTicketsData((prevTickets) => [...prevTickets, ...departmentTickets]); // Add the department tickets to ticketsData
                } catch (error) {
                  console.error("Error fetching department data:", error);
                }
              };

              // Check if the employee is a manager or admin
              if (employee.role === "manager" || employee.role === "admin") {
                managedDepartments.forEach((deptId) => {
                  fetchDepartmentTickets(deptId);
                });
              } else {
                console.error("Employee is neither a manager nor an admin.");
              }
            } else {
              console.error("Employee not found.");
            }
          })
          .catch((error) =>
            console.error("Error fetching employee data:", error)
          );
      } else {
        console.error("Invalid token payload. No employee ID found.");
      }
    } else {
      console.log("No access token found.");
    }
  }, []);

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full dark:bg-neutral-950 bg-Primary text-neutral-200 p-4 transition-all duration-300 ease-in-out z-10 flex flex-col ${
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
            href="/user-main"
            isExpanded={isExpanded}
          />
          <SidebarItem
            icon={<History size={20} />}
            label="History"
            href="/ticket-history"
            isExpanded={isExpanded}
          />
          <SidebarItem
            icon={<IconLayoutDashboard size={20} />}
            label="Admin Dashboard"
            href="/admin-dashboard"
            isExpanded={isExpanded}
          />
          <SidebarItem
            icon={<LogOut size={20} />}
            label="Log out"
            href="/"
            isExpanded={isExpanded}
            onClick={() => {
              document.cookie =
              "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; samesite=strict";
              // Redirect to the login page
              router.push("/");
            }}
          />
        </nav>
        <div className="mt-auto">
          <SidebarItem
            icon={themeIcon}
            label={theme === "dark" ? "Light Mode" : "Dark Mode"}
            onClick={toggleTheme}
            isExpanded={isExpanded}
          />
        </div>
      </aside>

      {/* Main content */}
      <main
        className={`flex-1 p-8 bg-neutral-100 dark:bg-Primary overflow-auto transition-all duration-300 ease-in-out ${
          isExpanded ? "ml-[300px]" : "ml-[72px]"
        }`}
      >
        <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
      <h1 className="text-3xl font-bold text-Primary dark:text-neutral-100">
       Tickets Assigned to you
      </h1>
      <div className="flex space-x-4">
        <button
          onClick={() => {
            setShowPending(true);
            setShowCompleted(false);
          }}
          className={`px-4 py-2 ${showPending ? "bg-blue-500" : "bg-Primary"} text-neutral-200 rounded hover:bg-opacity-80 transition-colors duration-300`}
        >
          Show Pending
        </button>
        <button
          onClick={() => {
            setShowCompleted(true);
            setShowPending(false);
          }}
          className={`px-4 py-2 ${showCompleted ? "bg-green-500" : "bg-Primary"} text-neutral-200 rounded hover:bg-opacity-80 transition-colors duration-300`}
        >
          Show Completed
        </button>
        <button
          onClick={() => {
            setShowPending(false);
            setShowCompleted(false);
          }}
          className={`px-4 py-2 ${!showPending && !showCompleted ? "bg-gray-500" : "bg-Primary"} text-neutral-200 rounded hover:bg-opacity-80 transition-colors duration-300`}
        >
          Show All
        </button>
      </div>
    </div>
    <AnimatePresence mode="wait">
      <motion.div
        key={currentPage + (showPending ? "pending" : showCompleted ? "completed" : "all")}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
      >
        <div className="space-y-4">
          {filterTickets().map((ticket) => (
            <TicketItem
              key={ticket._id}
              ticket={ticket}
              onView={handleViewTicket}
            />
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

      {/* Ticket Details Popup */}
      <AnimatePresence>
        {isPopupOpen && selectedTicket && (
          <TicketDetailsPopup
            ticket={selectedTicket}
            onClose={handleClosePopup}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function SidebarItem({
  icon,
  label,
  href,
  isExpanded,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  href?: string;
  isExpanded: boolean;
  onClick?: () => void;
}) {
  const content = (
    <div className="flex items-center mb-4 dark:text-neutral-200 hover:text-white cursor-pointer transition-colors duration-300" onClick={onClick}>
      <div className="w-8">{icon}</div>
      <span
        className={`ml-2 ${
          isExpanded ? "opacity-100" : "opacity-0 w-0"
        } transition-all duration-300`}
      >
        {label}
      </span>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return <div>{content}</div>;
}

function TicketItem({
  ticket,
  onView,
}: {
  ticket: any; // Consider defining a specific type
  onView: (ticket: any) => void;
}) {
  console.log(ticket.status); // Check the exact status value being passed

  const statusClass =
    ticket.status === "Open"
      ? "bg-blue-500"
      : ticket.status === "pending"
      ? "bg-yellow-500 !important"
      : ticket.status === "completed"
      ? "bg-green-500 !important"
      : "bg-gray-500"; // Default color for other statuses

  return (
    <div className="p-4 rounded-lg shadow-lg hover:shadow-2xl shadow-black/50 hover:shadow-black duration-300 bg-Primary space-y-8 space-x-8">
      <div className="flex items-start space-x-4">
        <img
          src="/Sidebar-icon.jpg"
          alt={ticket.createdBy.fullName}
          className="w-10 h-10 rounded-full"
        />
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-neutral-200 dark:text-neutral-200">
                {ticket.title}
              </h3>
              <p className="text-sm text-neutral-200 opacity-80 dark:text-neutral-200 dark:opacity-80">
                {ticket.createdBy.fullName}
              </p>
            </div>
            <span className="text-sm text-neutral-200 opacity-80 dark:text-neutral-200 dark:opacity-80 font-semibold">
              {new Date(ticket.createdAt).toLocaleDateString()}
            </span>
          </div>
          <p className="mt-2 text-sm text-neutral-200 opacity-90 dark:text-neutral-200 dark:opacity-90">
            {ticket.description}
          </p>
        </div>
      </div>
      <div className="flex justify-between items-center">
        <span className={`px-2 py-1 rounded-full text-xs font-semibold text-neutral-200 ${statusClass}`}>
          {ticket.status}
        </span>
        <button
          aria-label={`View ticket: ${ticket.title}`}
          className="mt-4 px-3 py-1 dark:bg-Primary dark:text-neutral-200 text-Primary bg-neutral-100 hover:dark:bg-neutral-200 hover:dark:text-neutral-950 font-semibold rounded text-sm hover:bg-opacity-80 transition-colors duration-300"
          onClick={() => onView(ticket)}
        >
          View
        </button>
      </div>
    </div>
  );
}


function TicketDetailsPopup({
  ticket,
  onClose,
}: {
  ticket: any;
  onClose: () => void;
}) {
  const handleRespond = () => {
    // Implement respond functionality
    console.log("Responding to ticket:", ticket.id);
    onClose();
  };

  const handleDelete = () => {
    // Implement delete functionality
    console.log("Deleting ticket:", ticket.id);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-xl max-w-md w-full m-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-bold text-Primary dark:text-neutral-200">
            {ticket.title}
          </h2>
          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
          >
            <X size={24} />
          </button>
        </div>
        <div className="mb-4">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            {ticket.user} - {ticket.date}
          </p>
          <p className="mt-2 text-neutral-800 dark:text-neutral-200">
            {ticket.description}
          </p>
          <p className="mt-2 text-sm font-semibold">
            Status:{" "}
            <span
              className={
                ticket.status === "pending"
                  ? "text-yellow-500"
                  : "text-green-500"
              }
            >
              {ticket.status}
            </span>
          </p>
        </div>
        <div className="flex justify-end space-x-4">
          <Link
            href="/admin-respond"
            className="px-4 py-2 bg-Primary text-white rounded hover:bg-blue-800 transition-colors duration-300 inline-block"
          >
            Respond
          </Link>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors duration-300"
          >
            Delete Ticket
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Page() {
  return (
    <ThemeProvider attribute="class">
      <TicketManagement />
    </ThemeProvider>
  );
}
