import { useEffect, useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Fish, MessageSquare, Gavel, HandHeart } from "lucide-react";
import { GetChartResponse, GetOverviewResponse } from "@/types/api/overview";
import { serviceOverview } from "@/services/overview";
// Recharts + Tabs
import {
  ResponsiveContainer,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Line,
} from "recharts";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

// Format angka singkat: 1.2 Jt, 450 Rb, 900
const fmtIDR = (value: number) => {
  const UNITS: Record<string, number> = { Jt: 1_000_000, Rb: 1_000 };
  for (const [label, base] of Object.entries(UNITS)) {
    if (value >= base) {
      const v = value / base;
      const fixed = Number.isInteger(v) ? v.toFixed(0) : v.toFixed(1);
      return `${fixed} ${label}`;
    }
  }
  return String(value);
};

const formatDateLabel = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID", { day: "2-digit", month: "short" });

const COLORS = {
  sell: "#2563eb", // blue-600
  nego: "#16a34a", // green-600
  auction: "#7c3aed", // purple-600
  total: "#ea580c", // orange-600
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<GetOverviewResponse>({
    activeKoiSell: 0,
    activeKoiNego: 0,
    activeKoiAuction: 0,
    unreadChat: 0,
  });
  const [loading, setLoading] = useState(true);
  const [chart, setChart] = useState<GetChartResponse[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [overview, chart] = await Promise.all([
          serviceOverview.getOverview(),
          serviceOverview.getChart(),
        ]);

        setStats(overview);
        setChart(chart);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: "Penjualan Reguler",
      value: stats.activeKoiSell,
      description: "Iklan koi aktif",
      icon: Fish,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Negosiasi",
      value: stats.activeKoiNego,
      description: "Negosiasi yang berjalan",
      icon: HandHeart,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Lelang",
      value: stats.activeKoiAuction,
      description: "Lelang yang sedang aktif",
      icon: Gavel,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Obrolan",
      value: stats.unreadChat,
      description: "Obrolan belum dibaca",
      icon: MessageSquare,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dasbor</h2>
          <p className="text-muted-foreground">
            Selamat datang di Dabskoi Admin Panel. Berikut ringkasan aktivitas
            marketplace koi Anda.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((card) => (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {card.title}
                </CardTitle>
                <div className={`p-2 rounded-full ${card.bgColor}`}>
                  <card.icon className={`h-4 w-4 ${card.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? "..." : card.value}
                </div>
                <p className="text-xs text-muted-foreground">
                  {card.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Grafik</CardTitle>
              <CardDescription>
                Grafik transaksi dan pendapatan marketplace koi Anda
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="count" className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="count">Transaksi</TabsTrigger>
                  <TabsTrigger value="amount">Pendapatan</TabsTrigger>
                </TabsList>

                {/* Transaksi */}
                <TabsContent value="count" className="m-0">
                  <div className="h-[360px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={chart}
                        margin={{ top: 10, right: 16, left: 4, bottom: 0 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          strokeOpacity={0.3}
                        />
                        <XAxis
                          dataKey="date"
                          tickFormatter={formatDateLabel}
                          interval="preserveStartEnd"
                          tickMargin={8}
                          minTickGap={16}
                        />
                        <YAxis allowDecimals={false} width={40} />
                        <Tooltip
                          labelFormatter={(v) => formatDateLabel(String(v))}
                          formatter={(val: unknown, name) => [
                            val as number,
                            name,
                          ]}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="countSell"
                          name="Jual"
                          stroke={COLORS.sell}
                          strokeWidth={2}
                          dot={{ r: 2 }}
                          activeDot={{ r: 4 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="countNego"
                          name="Nego"
                          stroke={COLORS.nego}
                          strokeWidth={2}
                          dot={{ r: 2 }}
                          activeDot={{ r: 4 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="countAuction"
                          name="Lelang"
                          stroke={COLORS.auction}
                          strokeWidth={2}
                          dot={{ r: 2 }}
                          activeDot={{ r: 4 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="countAll"
                          name="Total"
                          stroke={COLORS.total}
                          strokeWidth={3}
                          dot={{ r: 3 }}
                          activeDot={{ r: 5 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </TabsContent>

                {/* Pendapatan */}
                <TabsContent value="amount" className="m-0">
                  <div className="h-[360px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={chart}
                        margin={{ top: 10, right: 16, left: 4, bottom: 0 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          strokeOpacity={0.3}
                        />
                        <XAxis
                          dataKey="date"
                          tickFormatter={formatDateLabel}
                          interval="preserveStartEnd"
                          tickMargin={8}
                          minTickGap={16}
                        />
                        <YAxis
                          width={70}
                          tickFormatter={(v: number) => fmtIDR(v)}
                        />
                        <Tooltip
                          labelFormatter={(v) => formatDateLabel(String(v))}
                          formatter={(val: unknown, name) => [
                            fmtIDR(Number(val)),
                            name,
                          ]}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="totalAmountSell"
                          name="Jual"
                          stroke={COLORS.sell}
                          strokeWidth={2}
                          dot={{ r: 2 }}
                          activeDot={{ r: 4 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="totalAmountNego"
                          name="Nego"
                          stroke={COLORS.nego}
                          strokeWidth={2}
                          dot={{ r: 2 }}
                          activeDot={{ r: 4 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="totalAmountAuction"
                          name="Lelang"
                          stroke={COLORS.auction}
                          strokeWidth={2}
                          dot={{ r: 2 }}
                          activeDot={{ r: 4 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="totalAmountAll"
                          name="Total"
                          stroke={COLORS.total}
                          strokeWidth={3}
                          dot={{ r: 3 }}
                          activeDot={{ r: 5 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
