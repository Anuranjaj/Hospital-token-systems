"use client";

import { useCallback, useEffect, useState } from "react";
import api from "@/lib/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, XCircle, Clock, AlertCircle, RefreshCw } from "lucide-react";

interface Token {
  id: number;
  token_number: number;
  patient_name: string;
  status: string;
  date: string;
  doctor: {
    name: string;
  };
}

export default function AdminTokensPage() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const { toast } = useToast();

  const loadTokens = useCallback(async () => {
    const response = await api.get<Token[]>('tokens/');
    return response.data.sort((a, b) => {
      if (a.date !== b.date) return new Date(b.date).getTime() - new Date(a.date).getTime();
      return a.token_number - b.token_number;
    });
  }, []);

  const fetchTokens = useCallback(async () => {
    try {
      setTokens(await loadTokens());
    } catch {
      toast({ title: "Error fetching tokens", variant: "destructive" });
    }
  }, [loadTokens, toast]);

  useEffect(() => {
    let active = true;
    loadTokens()
      .then((loadedTokens) => { if (active) setTokens(loadedTokens); })
      .catch(() => { if (active) toast({ title: "Error fetching tokens", variant: "destructive" }); });
    return () => { active = false; };
  }, [loadTokens, toast]);

  const updateStatus = async (id: number, status: string) => {
    try {
      await api.patch(`tokens/${id}/`, { status });
      toast({ title: `Token marked as ${status}` });
      fetchTokens();
    } catch {
      toast({ title: "Failed to update status", variant: "destructive" });
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'Waiting': return <Badge variant="secondary" className="bg-amber-100 text-amber-800"><Clock className="w-3 h-3 mr-1"/> Waiting</Badge>;
      case 'Current': return <Badge variant="default" className="bg-blue-100 text-blue-800"><AlertCircle className="w-3 h-3 mr-1"/> Current</Badge>;
      case 'Consulted': return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200"><CheckCircle2 className="w-3 h-3 mr-1"/> Consulted</Badge>;
      case 'Not Reached': return <Badge variant="destructive" className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1"/> Not Reached</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Token Management</h2>
          <p className="text-slate-500">Manage daily tokens, update consultation status.</p>
        </div>
        <Button variant="outline" onClick={fetchTokens}>
          <RefreshCw className="w-4 h-4 mr-2" /> Refresh
        </Button>
      </div>

      <div className="border rounded-lg bg-white overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-[80px]">No.</TableHead>
              <TableHead>Patient Name</TableHead>
              <TableHead>Doctor</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tokens.map((token) => (
              <TableRow key={token.id}>
                <TableCell className="font-bold whitespace-nowrap">#{token.token_number}</TableCell>
                <TableCell className="font-medium whitespace-nowrap">{token.patient_name}</TableCell>
                <TableCell className="whitespace-nowrap">Dr. {token.doctor?.name}</TableCell>
                <TableCell className="text-slate-500 text-sm whitespace-nowrap">{token.date}</TableCell>
                <TableCell>{getStatusBadge(token.status)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {token.status === 'Waiting' && (
                      <Button size="sm" variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50" onClick={() => updateStatus(token.id, 'Current')}>
                        Call Next
                      </Button>
                    )}
                    {token.status === 'Current' && (
                      <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => updateStatus(token.id, 'Consulted')}>
                        Consulted
                      </Button>
                    )}
                    {(token.status === 'Waiting' || token.status === 'Current') && (
                      <Button size="sm" variant="destructive" onClick={() => updateStatus(token.id, 'Not Reached')}>
                        Not Reached
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {tokens.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-32 text-slate-500">
                  No tokens generated yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
