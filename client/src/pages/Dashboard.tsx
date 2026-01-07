import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "../lib/trpc";
import {
  Activity,
  ArrowRight,
  FileText,
  Vote,
  Users,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Dashboard() {
  // 1. Fetch Activity Data (The one we verified works)
  const {
    data: activities,
    isLoading: isActivitiesLoading,
    error,
  } = trpc.dashboard.getRecentActivity.useQuery({ limit: 4 });

  // 2. Safe Loading/Error States (Prevents White Screen)
  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-400 font-bold mb-2">Nepavyko užkrauti duomenų</div>
        <p className="text-sm text-gray-500">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Apžvalga</h1>
          <p className="text-[#92adc9] text-sm">Seimo veiklos suvestinė ir naujausi duomenys.</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-[#233648] text-white rounded-lg text-sm hover:bg-[#2d455d] transition-colors">
            Atnaujinti
          </button>
        </div>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Seimo nariai", value: "141", icon: Users, color: "text-blue-400" },
          { label: "Užregistruoti projektai", value: "2,340", icon: FileText, color: "text-purple-400" },
          { label: "Įvykę balsavimai", value: "856", icon: Vote, color: "text-green-400" },
          { label: "Aktyvumas", value: "87%", icon: TrendingUp, color: "text-yellow-400" },
        ].map((stat, i) => (
          <Card key={i} className="bg-[#1b2a38] border-[#2d455d]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#92adc9]">
                {stat.label}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN: ACTIVITY FEED */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-[#1b2a38] border-[#2d455d] h-full">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Naujausia veikla
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {isActivitiesLoading ? (
                  // SKELETON LOADERS
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex gap-3 animate-pulse">
                      <div className="w-10 h-10 rounded-full bg-[#233648]" />
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-[#233648] rounded w-3/4" />
                        <div className="h-3 bg-[#233648] rounded w-1/4" />
                      </div>
                    </div>
                  ))
                ) : activities && activities.length > 0 ? (
                  // REAL DATA
                  activities.map((item) => (
                    <div key={item.id} className="flex gap-4 items-start pb-4 border-b border-[#2d455d] last:border-0">
                      <div className="w-10 h-10 rounded-full bg-[#233648] flex items-center justify-center text-primary font-bold">
                        {item.mpName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-white text-sm">
                          <span className="font-bold">{item.mpName}</span> {item.action}{" "}
                          <span className="text-primary">{item.billTitle}</span>
                        </p>
                        <p className="text-xs text-[#92adc9] mt-1 uppercase tracking-wider font-bold">
                          {new Date(item.timestamp).toLocaleDateString('lt-LT')}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  // EMPTY STATE
                  <div className="text-center py-10">
                    <p className="text-[#92adc9]">Nėra Naujų Duomenų</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: QUICK LINKS */}
        <div className="space-y-6">
          <Card className="bg-[#1b2a38] border-[#2d455d]">
            <CardHeader>
              <CardTitle className="text-white">Greitosios nuorodos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/">
                <div className="p-3 bg-[#233648] rounded hover:bg-[#2d455d] cursor-pointer transition text-white text-sm flex justify-between group">
                  Seimo nariai
                  <ArrowRight className="w-4 h-4 text-[#92adc9] group-hover:text-white" />
                </div>
              </Link>
              <Link href="/bills">
                <div className="p-3 bg-[#233648] rounded hover:bg-[#2d455d] cursor-pointer transition text-white text-sm flex justify-between group">
                  Teisės aktai
                  <ArrowRight className="w-4 h-4 text-[#92adc9] group-hover:text-white" />
                </div>
              </Link>
              <Link href="/mps">
                <div className="p-3 bg-[#233648] rounded hover:bg-[#2d455d] cursor-pointer transition text-white text-sm flex justify-between group">
                  Balsavimai
                  <ArrowRight className="w-4 h-4 text-[#92adc9] group-hover:text-white" />
                </div>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
