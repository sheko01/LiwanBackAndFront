"use client";

import { useState, useEffect } from "react";
import { Moon, Sun, Home, User, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ThemeProvider, useTheme } from "next-themes";
import { Input } from "../components/ui/input";
import CryptoJS from "crypto-js";

export function PersonalInformation() {
  const [isExpanded, setIsExpanded] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  // LOGIN

  const [isSignedIn, setIsSignedIn] = useState(false);
  const [userId, setUserId] = useState(null);
  const [employeeData, setEmployeeData] = useState(null);

  // INPUT FIELDS

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [extension, setExtension] = useState("");
  const secretKey = "BD3621992B48F116B5AE8EBF656C7103";

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
    return null;
  };

  // Function to decode JWT
  const parseJwt = (token) => {
    const parts = token.split(".");
    if (parts.length !== 3) {
      throw new Error("JWT must have 3 parts");
    }

    const payload = parts[1];
    const decodedPayload = CryptoJS.enc.Base64.parse(
      payload.replace(/-/g, "+").replace(/_/g, "/")
    );
    const jsonPayload = decodedPayload.toString(CryptoJS.enc.Utf8);

    return JSON.parse(jsonPayload);
  };

  // Check if the user is signed in and fetch employee data
  useEffect(() => {
    const accessToken = getCookie("accessToken");
    setIsSignedIn(!!accessToken); // Update state based on token presence

    if (accessToken) {
      try {
        const decoded = parseJwt(accessToken);
        const id = decoded.id; // Assuming "id" is present in your payload

        // Fetch employee data using the ID
        const apiUrl = `http://127.0.0.1:5000/api/v1/employees/${id}`;

        fetch(apiUrl)
          .then((response) => {
            if (!response.ok) {
              throw new Error("Network response was not ok");
            }
            return response.json();
          })
          .then((data) => {
            setEmployeeData(data.data.employee); // Adjust this based on your API response structure
            // Set state values for the input fields
            setName(`${data.data.employee.fname} ${data.data.employee.lname}`);
            setPhoneNumber(data.data.employee.phoneNumber || ""); // Replace with actual key if different
            setEmail(data.data.employee.email);
            setExtension(data.data.employee.extensionsnumber);
          })
          .catch((error) => {
            console.error("Error fetching employee data:", error);
          });
      } catch (error) {
        console.error("Failed to decode token:", error);
      }
    }
  }, []);

  return (
    <div className="flex h-screen bg-Primary text-neutral-200">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-Primary text-neutral-200 transition-all duration-300 ease-in-out z-10 flex flex-col ${
          isExpanded ? "w-[300px]" : "w-[72px]"
        }`}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        <div className="flex items-center p-4 mb-8">
          <Link href="/Profile" className="flex items-center">
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
            icon={<User size={20} />}
            label="Profile"
            href="#"
            isExpanded={isExpanded}
          />
        </nav>
        <button
          onClick={toggleTheme}
          className={`mt-auto w-full py-4 flex items-center justify-center bg-primary-foreground text-primary hover:bg-slate-200 hover:text-Primary rounded-sm transition-colors duration-300`}
        >
          {mounted && theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          {isExpanded && (
            <span className="ml-2">
              {theme === "dark" ? "Light Mode" : "Dark Mode"}
            </span>
          )}
        </button>
      </aside>

      {/* Main content */}
      <main
        className={`flex-1 p-8 overflow-auto dark:bg-neutral-950 bg-neutral-200 text-Primary dark:text-neutral-200 transition-all duration-300 ease-in-out ${
          isExpanded ? "ml-[300px]" : "ml-[60px]"
        }`}
      >
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Personal Information</h1>
          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <form className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    {isSignedIn ? (
                      employeeData ? (
                        <div className="grid gap-6 md:grid-cols-4">
                          <div className="form-control col-span-2">
                            <Input
                              id="name"
                              type="text"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                            />
                          </div>
                          <div className="form-control col-span-2">
                            <Input
                              id="phone"
                              type="tel"
                              value={phoneNumber}
                              onChange={(e) => setPhoneNumber(e.target.value)}
                            />
                          </div>
                          <div className="form-control col-span-2">
                          <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                          />
                          </div>
                          <div className="form-control col-span-2">
                          <Input
                            id="extension"
                            type="text"
                            value={extension}
                            onChange={(e) => setExtension(e.target.value)}
                          />
                          </div>
                        </div>
                      ) : (
                        <p>Loading employee data...</p>
                      )
                    ) : (

                      <p>Loading...</p>
                    )}
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-Primary text-neutral-200 rounded transition-colors duration-300"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Expand/Collapse button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="fixed bottom-4 left-4 p-2 rounded-full bg-Primary text-neutral-200 hover:bg-primary-foreground hover:text-Primary transition-colors duration-300"
      >
        {isExpanded ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
      </button>
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
    <Link
      href={href}
      className="flex items-center mb-4 hover:text-white cursor-pointer transition-colors duration-300 px-4 py-2"
    >
      <div className="w-8">{icon}</div>
      <span
        className={`ml-2 ${
          isExpanded ? "opacity-100" : "opacity-0 w-0"
        } transition-all duration-300`}
      >
        {label}
      </span>
    </Link>
  );
}

function InputField({
  label,
  id,
  type,
}: {
  label: string;
  id: string;
  type: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-md font-semibold mb-1">
        {label}
      </label>
      <input
        type={type}
        id={id}
        name={id}
        className="w-full p-2 rounded bg-Primary text-neutral-200 border border-neutral-600 focus:outline-none focus:ring-2 focus:ring-primary-foreground"
      />
    </div>
  );
}

export default function PersonalInformationPage() {
  return (
    <ThemeProvider attribute="class">
      <PersonalInformation />
    </ThemeProvider>
  );
}
