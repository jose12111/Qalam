"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface VerseCardProps {
  arabic: string;
  english: string;
  explanation: string;
  chapter: number;
  verseNumber: number;
}

const VerseCard: React.FC<VerseCardProps> = ({
  arabic,
  english,
  explanation,
  chapter,
  verseNumber,
}) => {
  return (
    <Card className="w-full bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
      <CardHeader className="border-b dark:border-gray-700 pb-3">
        <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-50">
          Chapter {chapter}, Verse {verseNumber}
        </CardTitle>
        <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
          {english}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="text-right text-2xl font-arabic leading-relaxed text-gray-800 dark:text-gray-100">
          {arabic}
        </div>
        <div className="text-sm text-gray-700 dark:text-gray-300 border-t pt-4 dark:border-gray-700">
          <h3 className="font-medium mb-1 text-gray-800 dark:text-gray-200">Explanation:</h3>
          <p>{explanation}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default VerseCard;