import React from 'react';
import { Link } from 'wouter';
import {
    Shield,
    Home,
    Users,
    FileText,
    PieChart,
    BarChart
} from "lucide-react";

export const Sidebar = () => {
    return (
        <aside className="hidden lg:flex w-72 flex-col border-r border-emerald-800/30 bg-emerald-950/30 backdrop-blur-xl h-full shrink-0 z-20 fixed left-0 top-0 bottom-0">
            <div className="flex h-full flex-col justify-between p-6">
                <div className="flex flex-col gap-8">
                    {/* Branding */}
                    <div className="flex items-center gap-3 px-2">
                        <div className="relative flex items-center justify-center size-10 rounded-xl bg-gradient-to-br from-emerald-800 to-emerald-950 border border-emerald-700 shadow-lg shadow-black/40">
                            <Shield className="text-primary w-6 h-6 drop-shadow-[0_0_8px_rgba(245,159,10,0.6)]" />
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-white text-lg font-bold tracking-tight">Skaidrus Seimas</h1>
                            <p className="text-emerald-400/70 text-xs font-medium tracking-wide uppercase">Transparency Platform</p>
                        </div>
                    </div>
                    {/* Navigation Links */}
                    <nav className="flex flex-col gap-2">
                        <Link href="/">
                            <a className="group flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-primary/10 to-transparent border-l-2 border-primary transition-all duration-300">
                                <Home className="text-primary w-5 h-5 group-hover:scale-110 transition-transform" />
                                <span className="text-white text-sm font-medium">Home</span>
                            </a>
                        </Link>
                        <Link href="/mps">
                            <a className="group flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-emerald-900/40 text-emerald-100/70 hover:text-white transition-all duration-300 border-l-2 border-transparent hover:border-emerald-600">
                                <Users className="w-5 h-5 group-hover:text-emerald-300 transition-colors" />
                                <span className="text-sm font-medium">Deputies</span>
                            </a>
                        </Link>
                        <Link href="/bills">
                            <a className="group flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-emerald-900/40 text-emerald-100/70 hover:text-white transition-all duration-300 border-l-2 border-transparent hover:border-emerald-600">
                                <FileText className="w-5 h-5 group-hover:text-emerald-300 transition-colors" />
                                <span className="text-sm font-medium">Voting</span>
                            </a>
                        </Link>
                        <Link href="/budgets">
                            <a className="group flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-emerald-900/40 text-emerald-100/70 hover:text-white transition-all duration-300 border-l-2 border-transparent hover:border-emerald-600">
                                <PieChart className="w-5 h-5 group-hover:text-emerald-300 transition-colors" />
                                <span className="text-sm font-medium">Budgets</span>
                            </a>
                        </Link>
                        <Link href="/pulse">
                            <a className="group flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-emerald-900/40 text-emerald-100/70 hover:text-white transition-all duration-300 border-l-2 border-transparent hover:border-emerald-600">
                                <BarChart className="w-5 h-5 group-hover:text-emerald-300 transition-colors" />
                                <span className="text-sm font-medium">Analytics</span>
                            </a>
                        </Link>
                    </nav>
                </div>
                {/* Bottom User Profile */}
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-900/20 border border-emerald-800/30">
                    <div className="size-8 rounded-full bg-emerald-800 bg-cover bg-center border border-emerald-600" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuC0gV4cuPRoag2RufZV8_ljJ1dGKPcPxMVHQIL5V8-zt5bSiE5Q6cV_ooojm4Ir_RMNyUK-Z3vGMkol0hmk5pRkmxULLZd2ZpeqYZ6yizv6HXptcG5qhJzhjxR4aFnkmi7IH6onnPbCoN4pnjTKIQ2leVg4SAVU4NYxRfbVyCsQmcPW8WEp_mWsWTn-dAnVPm4wRZyN_mkPuGFpLqZ4V-K4JugM-d99afyv0sPXA2_b_JJcjKlgJ_USYm74VSO6Nx4vlByC7xqAEKI')" }}></div>
                    <div className="flex flex-col overflow-hidden">
                        <p className="text-sm font-medium text-white truncate">Jonas K.</p>
                        <p className="text-xs text-emerald-400 truncate">Citizen Observer</p>
                    </div>
                </div>
            </div>
        </aside>
    );
};
