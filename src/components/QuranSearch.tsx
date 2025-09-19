"use client";

import React, { useState, useCallback, useEffect } from "react";
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
  surahName: string;
}

const QuranSearch: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchResults, setSearchResults] = useState<Verse[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [surahNames, setSurahNames] = useState<Record<number, string>>({});

  // Fetch surah names on component mount
  useEffect(() => {
    const fetchSurahList = async () => {
      try {
        const response = await fetch("https://api.alquran.cloud/v1/surah");
        if (!response.ok) {
          throw new Error(`Failed to fetch surah list. Status: ${response.status}`);
        }
        const data = await response.json();
        const namesMap: Record<number, string> = {};
        data.data.forEach((surah: any) => {
          namesMap[surah.number] = surah.englishName;
        });
        setSurahNames(namesMap);
      } catch (err) {
        console.error("Error fetching surah list:", err);
        toast.error("Failed to load Surah names.");
      }
    };
    fetchSurahList();
  }, []);

  // Function to fetch Arabic text for a given verse
  const fetchArabicText = useCallback(async (surahNumber: number, ayahNumber: number): Promise<string | null> => {
    try {
      const arabicResponse = await fetch(`https://api.alquran.cloud/v1/ayah/${surahNumber}:${ayahNumber}/ar.quran-simple`);
      if (!arabicResponse.ok) {
        const errorText = await arabicResponse.text();
        console.error(`API Error: Failed to fetch Arabic text for ${surahNumber}:${ayahNumber}. Status: ${arabicResponse.status}. Response: ${errorText}`);
        throw new Error(`Failed to fetch Arabic text for ${surahNumber}:${ayahNumber}. Status: ${arabicResponse.status}. Response: ${errorText}`);
      }
      const arabicData = await arabicResponse.json();
      return arabicData.data.text;
    } catch (err) {
      console.error("Error fetching Arabic text:", err);
      return null;
    }
  }, []);

  // Function to fetch English text (Sahih International) for a given verse
  const fetchEnglishText = useCallback(async (surahNumber: number, ayahNumber: number): Promise<string | null> => {
    try {
      const englishResponse = await fetch(`https://api.alquran.cloud/v1/ayah/${surahNumber}:${ayahNumber}/en.sahih`);
      if (!englishResponse.ok) {
        const errorText = await englishResponse.text();
        console.error(`API Error: Failed to fetch English text for ${surahNumber}:${ayahNumber}. Status: ${englishResponse.status}. Response: ${errorText}`);
        throw new Error(`Failed to fetch English text for ${surahNumber}:${ayahNumber}. Status: ${englishResponse.status}. Response: ${errorText}`);
      }
      const englishData = await englishResponse.json();
      return englishData.data.text;
    } catch (err) {
      console.error("Error fetching English text:", err);
      return null;
    }
  }, []);

  // Function to fetch explanation (using en.maududi for detailed English translation/notes)
  const fetchExplanation = useCallback(async (surahNumber: number, ayahNumber: number): Promise<string | null> => {
    try {
      const explanationResponse = await fetch(`https://api.alquran.cloud/v1/ayah/${surahNumber}:${ayahNumber}/en.maududi`);
      if (!explanationResponse.ok) {
        const errorText = await explanationResponse.text();
        console.error(`API Error: Failed to fetch explanation for ${surahNumber}:${ayahNumber}. Status: ${explanationResponse.status}. Response: ${errorText}`);
        throw new Error(`Failed to fetch explanation for ${surahNumber}:${ayahNumber}. Status: ${explanationResponse.status}. Response: ${errorText}`);
      }
      const explanationData = await explanationResponse.json();
      return explanationData.data.text;
    } catch (err) {
      console.error("Error fetching explanation (Maududi):", err);
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
      const englishSearchUrl = `https://api.alquran.cloud/v1/search/${encodeURIComponent(searchTerm)}/all/en.sahih`;
      const arabicSearchUrl = `https://api.alquran.cloud/v1/search/${encodeURIComponent(searchTerm)}/all/ar.quran-simple`;

      const [englishResponse, arabicResponse] = await Promise.all([
        fetch(englishSearchUrl),
        fetch(arabicSearchUrl),
      ]);

      let combinedMatches: any[] = [];

      if (englishResponse.ok) {
        const englishSearchData = await englishResponse.json();
        if (englishSearchData.data && englishSearchData.data.matches) {
          combinedMatches = combinedMatches.concat(englishSearchData.data.matches);
        }
      } else {
        const errorText = await englishResponse.text();
        console.error(`API Error: Failed to fetch English search results. Status: ${englishResponse.status}. Response: ${errorText}`);
      }

      if (arabicResponse.ok) {
        const arabicSearchData = await arabicResponse.json();
        if (arabicSearchData.data && arabicSearchData.data.matches) {
          const existingVerseIds = new Set(combinedMatches.map(m => `${m.surah.number}:${m.numberInSurah}`));
          arabicSearchData.data.matches.forEach((match: any) => {
            const verseId = `${match.surah.number}:${match.numberInSurah}`;
            if (!existingVerseIds.has(verseId)) {
              combinedMatches.push(match);
            }
          });
        }
      } else {
        const errorText = await arabicResponse.text();
        console.error(`API Error: Failed to fetch Arabic search results. Status: ${arabicResponse.status}. Response: ${errorText}`);
      }

      if (combinedMatches.length > 0) {
        const fetchedVerses: Verse[] = [];
        // Limit to the first 10 matches for display
        const matchesToProcess = combinedMatches.slice(0, 10);

        // Fetch Arabic text, English text, and explanation for the selected matches concurrently
        const versePromises = matchesToProcess.map(async (match: any) => {
          if (!match.surah || typeof match.numberInSurah === 'undefined') {
            console.warn("Skipping malformed match:", match);
            return null;
          }

          const surahNumber = match.surah.number;
          const ayahNumber = match.numberInSurah;
          const surahName = surahNames[surahNumber] || `Chapter ${surahNumber}`;

          const [arabicText, englishText, explanationText] = await Promise.all([
            fetchArabicText(surahNumber, ayahNumber),
            fetchEnglishText(surahNumber, ayahNumber), // Use the new function
            fetchExplanation(surahNumber, ayahNumber)
          ]);

          if (arabicText && englishText && explanationText) {
            return {
              id: `${surahNumber}:${ayahNumber}`,
              arabic: arabicText,
              english: englishText,
              explanation: explanationText,
              chapter: surahNumber,
              verseNumber: ayahNumber,
              surahName: surahName,
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

        if (fetchedVerses.length > 0) {
          toast.success(`Search complete! Displaying ${fetchedVerses.length} verses with explanations.`, { id: loadingToastId });
        } else {
          toast.info("Initial search found matches, but no complete verses with Arabic text and explanation could be retrieved.", { id: loadingToastId, duration: 5000 });
        }
      } else {
        setSearchResults([]);
        toast.info("No verses found for your search term.", { id: loadingToastId });
      }
    } catch (err) {
      console.error("Search error:", err);
      setError("Failed to perform search. Please try again later.");
      toast.error("Failed to perform search.", { id: loadingToastId });
    } finally {
      setLoading(false);
    }
  }, [searchTerm, fetchArabicText, fetchEnglishText, fetchExplanation, surahNames]);

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <h1 className="text-3xl font-bold text-center mb-6 text-foreground">
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
        <p className="text-center text-destructive mb-4">{error}</p>
      )}

      {loading && searchResults.length === 0 && (
        <p className="text-center text-muted-foreground">Loading verses and explanations...</p>
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
              surahName={verse.surahName}
            />
          ))
        ) : (
          !loading && !error && searchTerm.trim() !== "" && (
            <p className="text-center text-muted-foreground">
              No verses found for your search term. Try 'Paradise' or 'Charity'!
            </p>
          )
        )}
        {!loading && !error && searchTerm.trim() === "" && (
          <p className="text-center text-muted-foreground">
            Enter a topic to search for Quranic verses.
          </p>
        )}
      </div>
    </div>
  );
};

export default QuranSearch;