import { useState, useMemo, Fragment } from "react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Handshake, TrendingUp, Table2, Grid3X3 } from "lucide-react";

const MONTHS_OPTS = [
  { value: 6, label: "6 mėn." },
  { value: 12, label: "12 mėn." },
  { value: 24, label: "24 mėn." },
] as const;

export default function Coalitions() {
  const [monthsBack, setMonthsBack] = useState(12);
  const [view, setView] = useState<"table" | "matrix">("table");

  const { data: pairs, isLoading, error } =
    trpc.coalitions.votingTogether.useQuery({
      limit: 50,
      minSharedBills: 5,
      monthsBack,
    });

  const { parties, matrix } = useMemo(() => {
    if (!pairs || pairs.length === 0) return { parties: [] as string[], matrix: [] as number[][] };
    const ps = new Set<string>();
    for (const p of pairs) {
      ps.add(p.partyA);
      ps.add(p.partyB);
    }
    const list = Array.from(ps).sort();
    const n = list.length;
    const idx = new Map(list.map((p, i) => [p, i]));
    const M = list.map(() => list.map(() => 0));
    for (const { partyA, partyB, agreementPct } of pairs) {
      const i = idx.get(partyA)!;
      const j = idx.get(partyB)!;
      M[i][j] = agreementPct;
      M[j][i] = agreementPct;
    }
    for (let i = 0; i < n; i++) M[i][i] = 100;
    return { parties: list, matrix: M };
  }, [pairs]);

  return (
    <DashboardLayout title="Balsavimo koalicijos">
      <div className="flex flex-col gap-2 mb-6">
        <h1 className="text-white text-3xl sm:text-4xl font-black leading-tight tracking-[-0.033em]">
          Balsavimo koalicijos
        </h1>
        <p className="text-[#92adc9] text-base font-normal leading-normal">
          Frakcijos, kurios dažniausiai balsuoja vienodai (už / prieš /
          susilaikė). Istoriniai trendai – pasirinkite laikotarpį.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-wide text-[#92adc9]">
            Laikotarpis:
          </span>
          <select
            value={monthsBack}
            onChange={e => setMonthsBack(Number(e.target.value))}
            className="rounded-lg border border-surface-border bg-surface-dark px-3 py-2 text-sm text-white focus:ring-2 focus:ring-primary"
          >
            {MONTHS_OPTS.map(o => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        {pairs && pairs.length > 0 && (
          <div className="flex rounded-lg border border-surface-border overflow-hidden">
            <button
              type="button"
              onClick={() => setView("table")}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
                view === "table"
                  ? "bg-primary text-black"
                  : "bg-surface-dark text-[#92adc9] hover:text-white"
              }`}
            >
              <Table2 className="w-4 h-4" />
              Lentelė
            </button>
            <button
              type="button"
              onClick={() => setView("matrix")}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
                view === "matrix"
                  ? "bg-primary text-black"
                  : "bg-surface-dark text-[#92adc9] hover:text-white"
              }`}
            >
              <Grid3X3 className="w-4 h-4" />
              Matrica
            </button>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full rounded-xl" />
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <Card className="bg-surface-dark border-surface-border">
          <CardContent className="p-8 text-center">
            <p className="text-red-400">Klaida užkraunant koalicijų duomenis.</p>
          </CardContent>
        </Card>
      ) : !pairs || pairs.length === 0 ? (
        <Card className="bg-surface-dark border-surface-border">
          <CardContent className="p-12 text-center">
            <Handshake className="w-16 h-16 text-[#92adc9]/50 mx-auto mb-4" />
            <p className="text-[#92adc9] text-lg font-medium">
              Koalicijų duomenų nerasta
            </p>
            <p className="text-[#92adc9]/70 text-sm mt-1">
              Reikia pakankamai balsavimų ir frakcijų, kurios balsavo dėl tų
              pačių įstatymų.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-surface-dark border-surface-border overflow-hidden">
          <CardHeader className="border-b border-surface-border">
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Sutapimas tarp frakcijų
            </CardTitle>
            <p className="text-[#92adc9] text-sm mt-1">
              Aukštesnis % reiškia, kad frakcijos dažniau balsuoja vienodai
              (už / prieš / susilaikė). Matrica – šilumos žemėlapis.
            </p>
          </CardHeader>
          <CardContent className="p-0">
            {view === "table" ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-surface-border">
                      <th className="text-left text-xs font-bold uppercase tracking-wider text-[#92adc9] py-4 px-4">
                        Frakcija A
                      </th>
                      <th className="text-left text-xs font-bold uppercase tracking-wider text-[#92adc9] py-4 px-4">
                        Frakcija B
                      </th>
                      <th className="text-right text-xs font-bold uppercase tracking-wider text-[#92adc9] py-4 px-4">
                        Sutapimas
                      </th>
                      <th className="text-right text-xs font-bold uppercase tracking-wider text-[#92adc9] py-4 px-4">
                        Bendri balsavimai
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {pairs!.map(row => (
                      <tr
                        key={`${row.partyA}-${row.partyB}`}
                        className="border-b border-surface-border/50 hover:bg-emerald-900/10 transition-colors"
                      >
                        <td className="py-4 px-4 font-medium text-white">
                          {row.partyA}
                        </td>
                        <td className="py-4 px-4 font-medium text-white">
                          {row.partyB}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <span
                            className={`font-bold ${
                              row.agreementPct >= 80
                                ? "text-accent-green"
                                : row.agreementPct >= 60
                                  ? "text-primary"
                                  : "text-[#92adc9]"
                            }`}
                          >
                            {row.agreementPct.toFixed(1)}%
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right text-[#92adc9] text-sm">
                          {row.sharedBills}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="overflow-x-auto p-4">
                <div
                  className="inline-grid gap-px bg-surface-border"
                  style={{
                    gridTemplateColumns: `minmax(120px,1fr) repeat(${parties.length}, minmax(56px, 64px))`,
                    gridTemplateRows: `auto repeat(${parties.length}, 36px)`,
                  }}
                >
                  <div />
                  {parties.map(p => (
                    <div
                      key={`col-${p}`}
                      className="bg-surface-dark px-2 py-2 text-[10px] font-bold uppercase tracking-wider text-[#92adc9] truncate"
                      title={p}
                    >
                      {p.split(/\s/).map(w => w[0]).join("")}
                    </div>
                  ))}
                  {parties.map((rowParty, i) => (
                    <Fragment key={`row-${rowParty}`}>
                      <div
                        className="bg-surface-dark px-2 py-2 text-xs font-medium text-white truncate flex items-center"
                        title={rowParty}
                      >
                        {rowParty}
                      </div>
                      {parties.map((colParty, j) => {
                        const v = matrix[i][j];
                        const opacity = v / 100;
                        return (
                          <div
                            key={`${i}-${j}`}
                            className="flex items-center justify-center text-xs font-medium"
                            style={{
                              backgroundColor: `rgba(16, 185, 129, ${0.15 + 0.6 * opacity})`,
                              color: opacity >= 0.5 ? "rgb(0,0,0)" : "rgb(226, 232, 240)",
                            }}
                            title={`${rowParty} × ${colParty}: ${v.toFixed(0)}%`}
                          >
                            {v > 0 ? `${v.toFixed(0)}` : "—"}
                          </div>
                        );
                      })}
                    </Fragment>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  );
}
