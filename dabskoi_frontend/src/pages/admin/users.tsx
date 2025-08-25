import AdminLayout from "@/components/layout/AdminLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Users, Search, Mail, Phone, MapPin } from "lucide-react";
import { GetUserOverviewResponse, GetUserResponse } from "@/types/api/user";
import { useEffect, useState } from "react";
import { serviceUser } from "@/services/user";

export default function AdminUsers() {
  const [users, setUsers] = useState<GetUserResponse[]>([]);
  const [userOverview, setUserOverview] = useState<GetUserOverviewResponse>({
    totalUserRoleUser: 0,
    totalUserRoleAdmin: 0,
    totalActiveUserThisWeek: 0,
    totalNewUserThisMonth: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    serviceUser.getUsers().then((res) => {
      setUsers(res);
    });
    serviceUser.getUserOverview().then((res) => {
      setUserOverview(res);
    });
  }, []);

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "ADMIN":
        return <Badge variant="destructive">Admin</Badge>;
      case "USER":
        return <Badge variant="default">Pengguna</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  const getStatusBadge = (lastActive: Date) => {
    const daysSinceActive = Math.floor(
      (Date.now() - new Date(lastActive).getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceActive === 0) {
      return <Badge variant="default">Aktif Hari Ini</Badge>;
    } else if (daysSinceActive <= 7) {
      return <Badge variant="secondary">Aktif Minggu Ini</Badge>;
    } else if (daysSinceActive <= 30) {
      return <Badge variant="outline">Aktif Bulan Ini</Badge>;
    } else {
      return <Badge variant="destructive">Tidak Aktif</Badge>;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              Manajemen Pengguna
            </h2>
            <p className="text-muted-foreground">
              Kelola pengguna dan informasi akun mereka
            </p>
          </div>
        </div>

        {/* Kartu Statistik */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Pengguna
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {userOverview.totalUserRoleUser}
              </div>
              <p className="text-xs text-muted-foreground">
                Pengguna terdaftar
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pengguna Aktif
              </CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {userOverview.totalActiveUserThisWeek}
              </div>
              <p className="text-xs text-muted-foreground">Aktif minggu ini</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Admin</CardTitle>
              <Users className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {userOverview.totalUserRoleAdmin}
              </div>
              <p className="text-xs text-muted-foreground">
                Akun administrator
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pengguna Baru Bulan Ini
              </CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {userOverview.totalNewUserThisMonth}
              </div>
              <p className="text-xs text-muted-foreground">Registrasi baru</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Semua Pengguna
            </CardTitle>
            <CardDescription>Daftar lengkap pengguna terdaftar</CardDescription>
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari pengguna berdasarkan nama atau email..."
                className="max-w-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pengguna</TableHead>
                  <TableHead>Kontak</TableHead>
                  <TableHead>Lokasi</TableHead>
                  <TableHead>Peran</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tanggal Gabung</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={user.picture || ""}
                            alt={user.name}
                          />
                          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-3 w-3" />
                          <span className="truncate max-w-[200px]">
                            {user.email}
                          </span>
                        </div>
                        {user.phone && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            <span>{user.phone}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate max-w-[150px]">
                          {user.address || "-"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>{getStatusBadge(user.updatedAt)}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>
                          {new Date(user.createdAt).toLocaleDateString("id-ID")}
                        </p>
                        <p className="text-muted-foreground">
                          {user.dayRegistered} hari yang lalu
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
