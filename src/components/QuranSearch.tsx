"use client";

import React, { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import VerseCard from "./VerseCard";
import { Search } from "lucide-react";
import { toast } from "sonner"; // Using sonner for notifications

interface Verse {
  id: string;
  arabic: string;
  english: string;
  explanation: string;
  chapter: number;
  verseNumber: number;
}

const QuranSearch: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchResults, setSearchResults] = useState<Verse[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch Arabic text for a given verse
  const fetchArabicText = useCallback(async (surahNumber: number, ayahNumber: number): Promise<string | null> => {
    try {
      const arabicResponse = await fetch(`https://api.alquran.cloud/v1/ayah/${surahNumber}:${ayahNumber}/ar.quran-simple`);
      if (!arabicResponse.ok) {
        const errorText = await arabicResponse.text();
        throw new Error(`Failed to fetch Arabic text for ${surahNumber}:${ayahNumber}. Status: ${arabicResponse.status}. Response: ${errorText}`);
      }
      const arabicData = await arabicResponse.json();
      return arabicData.data.text;
    } catch (err) {
      console.error("Error fetching Arabic text:", err);
      return null;
    }
  }, []);

  // Function to fetch explanation (Tafsir Muyassar) for a given verse
  const fetchExplanation = useCallback(async (surahNumber: number, ayahNumber: number): Promise<string | null> => {
    try {
      const explanationResponse = await fetch(`https://api.alquran.cloud/v1/ayah/${surahNumber}:${ayahNumber}/en.tafsir_al_muyassar`);
      if (!explanationResponse.ok) {
        const errorText = await explanationResponse.text();
        throw new Error(`Failed to fetch explanation for ${surahNumber}:${ayahNumber}. Status: ${explanationResponse.status}. Response: ${errorText}`);
      }
      const explanationData = await explanationResponse.json();
      return explanationData.data.text;
    } catch (err) {
      console.error("Error fetching explanation:", err);
      return null;
    }
  }, []);

  const handleSearch = useCallback(async () => {
    if (searchTerm.trim() === "") {
      setSearchResults([]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    setSearchResults([]);
    const loadingToastId = toast.loading("Searching for verses and explanations...");

    try {
      // Search for the query in English translation (Sahih International edition)
      const searchResponse = await fetch(`https://api.alquran.cloud/v1/search/${encodeURIComponent(searchTerm)}/all/en.sahih`);
      if (!searchResponse.ok) {
        const errorText = await searchResponse.text();
        throw new Error(`Failed to fetch search results from Quran API. Status: ${searchResponse.status}. Response: ${errorText}`);
      }
      const searchData = await searchResponse.json();

      if (searchData.data && searchData.data.matches && searchData.data.matches.length > 0) {
        const fetchedVerses: Verse[] = [];
        
        // Fetch Arabic text and explanation for all matches concurrently
        const versePromises = searchData.data.matches.map(async (match: any) => {
          // Add checks for surah and ayah existence
          if (!match.surah || !match.ayah) {
            console.warn("Skipping malformed match:", match);
            return null;
          }

          const surahNumber = match.surah.number;
          const ayahNumber = match.ayah.number;
          const englishText = match.ayah.text;

          const [arabicText, explanationText] = await Promise.all([
            fetchArabicText(surahNumber, ayahNumber),
            fetchExplanation(surahNumber, ayahNumber)
          ]);

          if (arabicText && explanationText) {
            return {
              id: `${surahNumber}:${ayahNumber}`,
              arabic: arabicText,
              english: englishText,
              explanation: explanationText,
              chapter: surahNumber,
              verseNumber: ayahNumber,
            };
          }
          return null;
        });

        const resolvedVerses = await Promise.all(versePromises);
        resolvedVerses.forEach(verse => {
          if (verse) {
            fetchedVerses.push(verse);
          }
        });

        setSearchResults(fetchedVerses);
        toast.success("Search complete with explanations!", { id: loadingToastId });
      } else {
        setSearchResults([]);
        toast.info("No verses found for your search term.", { id: loadingToastId });
      }
    } catch (err) {
      console.error("Search error:", err); // This will now log a more detailed error object
      setError("Failed to perform search. Please try again later.");
      toast.error("Failed to perform search.", { id: loadingToastId });
    } finally {
      setLoading(false);
    }
  }, [searchTerm, fetchArabicText, fetchExplanation]);

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <h1 className="text-3xl font-bold text-center mb-6 text-gray-900 dark:text-gray-50">
        Search the Quran
      </h1>
      <div className="flex w-full max-w-md items-center space-x-2 mx-auto mb-8">
        <Input
          type="text"
          placeholder="e.g., Paradise, Jannah, Charity, Sadaqa"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              handleSearch();
            }
          }}
          className="flex-grow"
          disabled={loading}
        />
        <Button onClick={handleSearch} className="flex-shrink-0" disabled={loading}>
          {loading ? "Searching..." : <><Search className="mr-2 h-4 w-4" /> Search</>}
        </Button>
      </div>

      {error && (
        <p className="text-center text-red-500 mb-4">{error}</p>
      )}

      {loading && searchResults.length === 0 && (
        <p className="text-center text-gray-500 dark:text-gray-400">Loading verses and explanations...</p>
      )}

      <div className="space-y-4">
        {searchResults.length > 0 ? (
          searchResults.map((verse) => (
            <VerseCard
              key={verse.id}
              arabic={verse.arabic}
              english={verse.english}
              explanation={verse.explanation}
              chapter={verse.chapter}
              verseNumber={verse.verseNumber}
            />
          ))
        ) : (
          !loading && !error && searchTerm.trim() !== "" && (
            <p className="text-center text-gray-500 dark:text-gray-400">
              No verses found for your search term. Try 'Paradise' or 'Charity'!
            </p>
          )
        )}
        {!loading && !error && searchTerm.trim() === "" && (
          <p className="text-center text-gray-500 dark:text-gray-400">
            Enter a topic to search for Quranic verses.
          </p>
        )}
      </div>
    </div>
  );
};

export default QuranSearch;