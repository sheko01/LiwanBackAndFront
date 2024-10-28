"use client";
import React from "react";
import { IconHome, IconMessage, IconUser } from "@tabler/icons-react";
import { div } from "framer-motion/client";
import Form from "@/app/components/ui/submit-form";
import { ThemeProvider } from "next-themes";
export default function page() {
    return (
        <main className="bg-Primary">
            <ThemeProvider attribute="class">
              <Form />
            </ThemeProvider>
        </main>
    );
}
