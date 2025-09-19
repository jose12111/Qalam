"use client";

import { MadeWithDyad } from "@/components/made-with-dyad";
import QuranSearch from "@/components/QuranSearch"; // Import the QuranSearch component

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="flex-grow flex items-center justify-center w-full">
        <QuranSearch />
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default Index;