"use client";
import { useState } from "react";
import { Send } from "lucide-react";

const NewsletterInput = () => {
  const [email, setEmail] = useState("");

  return (
    <div className="relative w-full">
      <input
        type="email"
        placeholder="Your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full text-sm bg-white dark:bg-neutral-800 
        border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 
        pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
      />
      {email.trim() !== "" && (
        <Send
          size={18}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-500 
          cursor-pointer hover:scale-110 transition"
          onClick={() => {}}
        />
      )}
    </div>
  );
};

export default NewsletterInput;
