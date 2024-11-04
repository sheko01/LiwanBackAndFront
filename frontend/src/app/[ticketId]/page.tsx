"use client";
import React from "react";
import { IconHome, IconMessage, IconUser } from "@tabler/icons-react";
import { div } from "framer-motion/client";
import TicketForm from "../components/ui/submit-response";
import { ThemeProvider } from "next-themes";
import { useRouter } from "next/navigation";
export default function page() {;
    return (
        <main className="bg-Primary">
            <ThemeProvider attribute="class">
              <TicketForm />
            </ThemeProvider>
        </main>
    );
}


