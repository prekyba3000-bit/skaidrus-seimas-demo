export const PARTY_COLORS: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  "Tėvynės sąjunga - Lietuvos krikščionys demokratai": {
    bg: "bg-blue-500/20",
    text: "text-blue-400",
    border: "border-blue-500/30",
  },
  "Lietuvos socialdemokratų partija": {
    bg: "bg-red-500/20",
    text: "text-red-400",
    border: "border-red-500/30",
  },
  "Liberalų sąjūdis": {
    bg: "bg-amber-500/20",
    text: "text-amber-400",
    border: "border-amber-500/30",
  },
  "Darbo partija": {
    bg: "bg-orange-500/20",
    text: "text-orange-400",
    border: "border-orange-500/30",
  },
  "Laisvės partija": {
    bg: "bg-purple-500/20",
    text: "text-purple-400",
    border: "border-purple-500/30",
  },
  "Lietuvos valstiečių ir žaliųjų sąjunga": {
    bg: "bg-green-500/20",
    text: "text-green-400",
    border: "border-green-500/30",
  },
  "Lietuvos lenkų rinkimų akcija": {
    bg: "bg-pink-500/20",
    text: "text-pink-400",
    border: "border-pink-500/30",
  },
  default: {
    bg: "bg-slate-500/20",
    text: "text-slate-400",
    border: "border-slate-500/30",
  },
};

export function getPartyColors(partyName: string | null | undefined) {
  if (!partyName) return PARTY_COLORS.default;
  return PARTY_COLORS[partyName] || PARTY_COLORS.default;
}
