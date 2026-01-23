import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { format } from "date-fns";
import { lt } from "date-fns/locale";
import type { SeismicEvent } from "./SeismographChart";

interface DetailSheetProps {
    event: SeismicEvent | null;
    onClose: () => void;
}

export function DetailSheet({ event, onClose }: DetailSheetProps) {
    if (!event) return null;

    return (
        <Sheet open={!!event} onOpenChange={(open) => !open && onClose()}>
            <SheetContent side="bottom" className="h-[400px] sm:h-[300px] border-t border-slate-700 bg-slate-950/95 backdrop-blur-xl">
                <SheetHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <SheetTitle className="text-xl font-bold text-slate-100 max-w-xl text-left">
                                {event.question}
                            </SheetTitle>
                            <SheetDescription className="text-slate-400 mt-1 flex items-center gap-2">
                                <span>{format(new Date(event.date), "PPP", { locale: lt })}</span>
                                <span className="w-1 h-1 bg-slate-600 rounded-full" />
                                <span className="text-orange-400">Magnitude: {event.magnitude.toFixed(1)}</span>
                            </SheetDescription>
                        </div>

                        <div className="text-right hidden sm:block">
                            <div className="text-2xl font-mono text-slate-200">
                                {event.margin} <span className="text-xs text-slate-500 uppercase">Margin</span>
                            </div>
                            <div className="text-xs text-slate-500">
                                {event.totalVoted} Votes Cast
                            </div>
                        </div>
                    </div>
                </SheetHeader>

                <div className="mt-8 grid grid-cols-2 gap-4">
                    {/* MP A Vote */}
                    <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 text-center">
                        <div className="text-xs text-slate-500 uppercase tracking-widest mb-2">Member A</div>
                        <div className={`text-2xl font-bold ${getVoteColor(event.mpAVote)}`}>
                            {translateVote(event.mpAVote)}
                        </div>
                    </div>

                    {/* MP B Vote */}
                    <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 text-center">
                        <div className="text-xs text-slate-500 uppercase tracking-widest mb-2">Member B</div>
                        <div className={`text-2xl font-bold ${getVoteColor(event.mpBVote)}`}>
                            {translateVote(event.mpBVote)}
                        </div>
                    </div>
                </div>

                {/* Mobile Stat Row */}
                <div className="mt-4 flex justify-between sm:hidden text-sm text-slate-400 border-t border-slate-800 pt-4">
                    <div>Margin: <span className="text-white">{event.margin}</span></div>
                    <div>Total: <span className="text-white">{event.totalVoted}</span></div>
                </div>

            </SheetContent>
        </Sheet>
    );
}

function getVoteColor(vote: string) {
    const v = vote.toLowerCase();
    if (v.includes("for") || v.includes("už")) return "text-green-500";
    if (v.includes("against") || v.includes("prieš")) return "text-red-500";
    if (v.includes("abstain") || v.includes("susilaikė")) return "text-yellow-500";
    return "text-slate-400";
}

function translateVote(vote: string) {
    // Basic mapping if raw DB values are English or specific codes
    // Assuming DB has 'for', 'against', 'abstain' or similar
    // Just returning raw for now, can enhance later
    return vote.toUpperCase();
}
