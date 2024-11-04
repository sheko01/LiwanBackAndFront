"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import {
  IconUpload,
  IconChevronLeft,
  IconSun,
  IconMoon,
} from "@tabler/icons-react";
import Link from "next/link";
import Image from "next/image";
import { Input } from "../ui/input";

const TicketForm = () => {
  const [file, setFile] = useState<File | null>(null);
  const [issueType, setIssueType] = useState("");
  const { theme, setTheme } = useTheme();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
    }
  };

  const handleIssueTypeChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setIssueType(event.target.value);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Handle form submission
    console.log("Issue Type:", issueType);
    // Add other form data handling here
  };
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);


  const [selectedCard, setSelectedCard] = useState<number | null>(null);

  const selectCard = (index: number) => {
    setSelectedCard(prev => prev === index ? null : index);
  };

  const tickets = [
    {
      title: "Login Issue",
      status: "Pending",
      raisedBy: "John Doe",
      description: "Unable to log in to the application. The user reports that they are receiving an 'Invalid Credentials' error message even when using the correct username and password. This issue has been persistent for the last 24 hours and is affecting multiple users across different departments.",
      creationDate: "2023-05-15",
      department: "Finance",
    },
    {
      title: "Feature Request",
      status: "Pending",
      raisedBy: "Jane Smith",
      description: "Add dark mode to the dashboard. Several users have requested a dark mode option for the main dashboard to reduce eye strain during night shifts. This feature would include a toggle in the user settings to switch between light and dark themes, affecting all dashboard components and data visualizations.",
      creationDate: "2023-05-14",
      department: "Software",
    },
    {
      title: "Bug Report",
      status: "Pending",
      raisedBy: "Mike Johnson",
      description: "Incorrect data displayed in reports. The monthly sales report is showing discrepancies between the total sales figure and the sum of individual product sales. This issue was first noticed in the April 2023 report and has been confirmed to affect reports from January 2023 onwards.",
      creationDate: "2023-05-13",
      department: "Marketing",
    },
    {
      title: "Performance Issue",
      status: "Pending",
      raisedBy: "Emily Brown",
      description: "Slow loading times on the main page. Users are experiencing significant delays when loading the main dashboard, with average load times exceeding 10 seconds. This is particularly noticeable during peak hours (9 AM - 11 AM) and is impacting productivity across all departments.",
      creationDate: "2023-05-12",
      department: "Humnn Resources",
    },
  ];



  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <Link
            href="/user-main/ticket"
            className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            <IconChevronLeft className="h-6 w-6" />
          </Link>
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            {theme === "dark" ? (
              <IconSun className="h-6 w-6" />
            ) : (
              <IconMoon className="h-6 w-6" />
            )}
          </button>
        </div>

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Submit a Response
          </h1>
          {isClient && (
            <Image
              src={
                theme === "dark"
                  ? "/liwan-dark-no-bg.png"
                  : "/liwan-logo-inverted.png"
              }
              width={100}
              height={40}
              alt="Liwan Logo"
            />
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="mb-8">
            <label className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">
              Search for Tickets
            </label>
            <input
              type="text"
              placeholder="Search for tickets..."
              className="w-full px-4 py-3 text-gray-700 dark:text-gray-300 rounded-lg bg-gray-100 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {tickets.map((ticket, index) => (
          <div
            key={index}
            className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 cursor-pointer ${
              selectedCard === index 
                ? 'ring-2 ring-blue-500 transform scale-105' 
                : ''
            }`}
            onClick={() => selectCard(index)}
          >
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              {ticket.title}
            </h3>
            <div className="flex justify-between items-center mb-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                ticket.status === 'Open' ? 'bg-green-200 text-green-800' :
                ticket.status === 'In Progress' ? 'bg-yellow-200 text-yellow-800' :
                'bg-red-200 text-red-800'
              }`}>
                {ticket.status}
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Created on: {ticket.creationDate}
              </span>
            </div>
            <p className="text-base text-gray-600 dark:text-gray-400 mb-3">
              by: {ticket.raisedBy}
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed line-clamp-3">
              {ticket.description}
            </p>
          </div>
        ))}
      </div>
          <div>
            <label
              htmlFor="issue-description"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Response
            </label>
            <textarea
              id="issue-description"
              rows={6}
              className="w-full px-3 py-2 text-gray-700 dark:text-gray-300 rounded-md bg-gray-100 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your response here..."
            ></textarea>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-right">
              max 1000 words
            </p>
          </div>
          <div>
            <label
              htmlFor="file-upload"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Attach a file
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-700 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <IconUpload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600 dark:text-gray-400">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                  >
                    <span>Upload a file</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      onChange={handleFileChange}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  PNG, JPG, GIF up to 10MB
                </p>
              </div>
            </div>
          </div>
          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#C8A97E] hover:bg-[#B69A6F] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#C8A97E]"
            >
              SUBMIT
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default TicketForm;
