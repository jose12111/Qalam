"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { BookOpen } from "lucide-react"; // Import the BookOpen icon

const QuranHeader: React.FC = () => {
  return (
    <Card className="w-full max-w-3xl mb-8 bg-primary text-primary-foreground shadow-lg border border-primary">
      <CardHeader className="text-center">
        <CardTitle className="text-4xl font-extrabold text-primary-foreground mb-2 flex items-center justify-center gap-3"> {/* Added flex, items-center, justify-center, gap-3 */}
          <BookOpen className="h-10 w-10" /> {/* Added the BookOpen icon */}
          Quran Explorer
        </CardTitle>
        <CardDescription className="text-base text-primary-foreground/80 leading-relaxed">
          Search and explore verses of the Holy Quran by topic. Discover the wisdom and guidance with Arabic text, English translations, and detailed explanations.
        </CardDescription>
      </CardHeader>
    </Card>
  );
};

export default QuranHeader;