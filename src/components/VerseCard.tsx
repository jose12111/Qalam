"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface VerseCardProps {
  arabic: string;
  english: string;
  explanation: string;
  chapter: number;
  verseNumber: number;
  surahName: string; // Added surahName
}

const VerseCard: React.FC<VerseCardProps> = ({
  arabic,
  english,
  explanation,
  chapter,
  verseNumber,
  surahName, // Destructure surahName
}) => {
  return (
    <Card className="w-full bg-card text-card-foreground shadow-lg hover:shadow-xl transition-shadow duration-200 rounded-lg overflow-hidden border border-border hover:ring-2 hover:ring-primary/50">
      <CardHeader className="border-b-2 border-primary pb-3">
        <CardTitle className="text-base font-semibold text-primary truncate">
          Surah {surahName}, Surah {chapter} Verse {verseNumber}
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          {english}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="text-right text-2xl font-arabic leading-relaxed text-foreground bg-emerald-50 dark:bg-emerald-900 p-3 rounded-md">
          {arabic}
        </div>
        <div className="text-sm text-muted-foreground border-t-2 border-primary pt-4">
          <h3 className="font-medium mb-1 text-foreground">Explanation:</h3>
          <p>{explanation}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default VerseCard;