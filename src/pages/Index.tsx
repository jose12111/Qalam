"use client";

import { MadeWithDyad } from "@/components/made-with-dyad";
import QuranSearch from "@/components/QuranSearch";
import QuranHeader from "@/components/QuranHeader"; // Import the new QuranHeader component

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-4">
      <div className="flex-grow flex flex-col items-center justify-center w-full">
        <QuranHeader /> {/* Add the QuranHeader component here */}
        <QuranSearch />
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default Index;