"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Clock, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface Token {
  id: number;
  token_number: number;
  status: "Waiting" | "Current" | "Consulted" | "Not Reached";
  doctor: {
    id: number;
    name: string;
    specialization: { name: string } | null;
  };
}

export default function LiveTokenDisplay() {
  const [tokens, setTokens] = useState<Token[]>([]);

  useEffect(() => {
    let active = true;
    const fetchLiveTokens = () => {
      api.get<Token[]>('tokens/live/')
        .then((response) => { if (active) setTokens(response.data); })
        .catch(() => console.error("Failed to fetch live tokens"));
    };
    fetchLiveTokens();
    const intervalId = setInterval(fetchLiveTokens, 5000);
    return () => {
      active = false;
      clearInterval(intervalId);
    };
  }, []);

  // Group tokens by doctor
  const tokensByDoctor = tokens.reduce((acc, token) => {
    if (!token.doctor) return acc;
    const docId = token.doctor.id;
    if (!acc[docId]) {
      acc[docId] = {
        doctor: token.doctor,
        tokens: []
      };
    }
    acc[docId].tokens.push(token);
    return acc;
  }, {} as Record<number, { doctor: Token['doctor'], tokens: Token[] }>);

  return (
    <div className="container mx-auto px-4 py-16 min-h-[80vh]">
      <div className="mb-8">
        <Link href="/">
          <Button variant="ghost" className="text-slate-600 hover:text-slate-900 p-0">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
          </Button>
        </Link>
      </div>

      <div className="text-center mb-16">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight flex items-center justify-center gap-3">
          <Activity className="h-10 w-10 text-blue-600 animate-pulse" /> Live Token Status
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Real-time tracking of current, next, and waiting tokens for all our specialists.
        </p>
      </div>

      {Object.values(tokensByDoctor).length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <Clock className="mx-auto h-16 w-16 text-slate-300 mb-4" />
          <h3 className="text-xl font-medium text-slate-600">No active tokens right now</h3>
          <p className="text-slate-500 mt-2">Check back later when consultations begin.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {Object.values(tokensByDoctor).map(({ doctor, tokens }) => {
            const currentTokens = tokens.filter(t => t.status === "Current");
            const waitingTokens = tokens.filter(t => t.status === "Waiting").sort((a,b) => a.token_number - b.token_number);
            const nextToken = waitingTokens.length > 0 ? waitingTokens[0] : null;

            return (
              <Card key={doctor.id} className="overflow-hidden shadow-lg border-x-0 border-b-0 border-t-4 border-blue-600 rounded-2xl">
                <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                  <CardTitle className="flex justify-between items-center text-xl">
                    <span>Dr. {doctor.name} <span className="text-sm font-normal text-slate-500 ml-2">({doctor.specialization?.name || 'General'})</span></span>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      {waitingTokens.length} Waiting
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-100">
                    <div className="flex-1 p-6 bg-blue-50/50 flex flex-col items-center justify-center min-h-[160px]">
                      <h4 className="text-sm font-semibold text-blue-800 uppercase tracking-widest mb-2">Current Token</h4>
                      {currentTokens.length > 0 ? (
                        <div className="text-center">
                          <span className="text-6xl font-black text-blue-600 block mb-1">
                            {currentTokens[0].token_number}
                          </span>
                          <span className="text-blue-800 font-medium">Wait outside Cabin</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 font-medium tracking-wide">None Active</span>
                      )}
                    </div>
                    <div className="flex-1 p-6 flex flex-col items-center justify-center min-h-[160px]">
                      <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-2">Next Token</h4>
                      {nextToken ? (
                        <div className="text-center">
                          <span className="text-5xl font-black text-slate-700 block mb-1">
                            {nextToken.token_number}
                          </span>
                          <span className="text-slate-500 text-sm">Please be ready</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 font-medium tracking-wide">None Waiting</span>
                      )}
                    </div>
                  </div>
                  
                  {waitingTokens.length > 1 && (
                    <div className="bg-slate-50 p-4 border-t border-slate-100">
                      <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Also Waiting</h4>
                      <div className="flex flex-wrap gap-2">
                        {waitingTokens.slice(1).map(wt => (
                          <Badge key={wt.id} variant="secondary" className="bg-slate-200 text-slate-700 hover:bg-slate-300 px-3 py-1 text-sm">
                            #{wt.token_number}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
