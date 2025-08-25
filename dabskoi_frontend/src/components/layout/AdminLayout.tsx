// AdminLayout.tsx
import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupContent,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Fish,
  LayoutDashboard,
  MessageSquare,
  Users,
  LogOut,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import { GetProfileResponse } from "@/types/api/account";
import { useSocketEvent } from "@/socket/SocketProvider";
import { toast } from "sonner";
import type { AuctionNotifyPayload } from "@/socket/types";

interface AdminLayoutProps {
  children: ReactNode;
}

const menuItems = [
  { title: "Dasbor", icon: LayoutDashboard, href: "/admin" },
  {
    title: "Manajemen Koi",
    icon: Fish,
    items: [
      { title: "Penjualan Reguler", href: "/admin/koi/sells" },
      { title: "Negosiasi", href: "/admin/koi/negotiations" },
      { title: "Lelang", href: "/admin/koi/auctions" },
    ],
  },
  { title: "Obrolan", icon: MessageSquare, href: "/admin/chat" },
  { title: "Pengguna", icon: Users, href: "/admin/users" },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const [user, setUser] = useState<GetProfileResponse | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const userData = localStorage.getItem("user");
    if (!token) {
      router.push("/login");
      return;
    }
    if (userData) setUser(JSON.parse(userData));
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    router.push("/login");
  };

  // Notifikasi chat masuk
  useSocketEvent("admin:chat:new", ({ message }) => {
    toast.success("Pesan baru dari " + (message.user?.name ?? "Pengguna"), {
      action: {
        label: "Lihat",
        onClick: () =>
          router.push(`/admin/chat?userId=${message.user?.id ?? ""}`),
      },
    });
  });

  // Notifikasi lelang
  useSocketEvent("admin:auction:notify", (p: AuctionNotifyPayload) => {
    toast.success(p.message, {
      action: {
        label: "Lihat",
        onClick: () =>
          router.push(`/admin/koi/auctions?auctionId=${p.auction.id}`),
      },
    });
  });

  if (!user) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-10 h-10 border-t-transparent border-b-transparent border-r-transparent border-l-transparent border-2 border-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar>
          <SidebarHeader className="border-b border-sidebar-border">
            <div className="flex items-center gap-2 px-4 py-2">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Fish className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Dabskoi</h2>
                <p className="text-xs text-muted-foreground">Panel Admin</p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      {item.items ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <SidebarMenuButton className="w-full justify-between">
                              <div className="flex items-center gap-2">
                                <item.icon className="h-4 w-4" />
                                <span>{item.title}</span>
                              </div>
                              <ChevronDown className="h-4 w-4" />
                            </SidebarMenuButton>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            side="right"
                            align="start"
                            className="w-48"
                          >
                            {item.items.map((subItem) => (
                              <DropdownMenuItem key={subItem.href} asChild>
                                <Link href={subItem.href} className="w-full">
                                  {subItem.title}
                                </Link>
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : (
                        <SidebarMenuButton asChild>
                          <Link href={item.href!}>
                            <item.icon className="h-4 w-4" />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      )}
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <SidebarInset className="flex-1 f">
          <header className="flex h-16 shrink-0 items-center justify-between border-b bg-background px-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <h1 className="text-lg font-semibold">Dasbor Admin</h1>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.picture || ""} alt={user.name} />
                    <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{user.name}</p>
                    <p className="w-[200px] truncate text-sm text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </div>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Keluar</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </header>

          <main className="flex-1 p-6">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
