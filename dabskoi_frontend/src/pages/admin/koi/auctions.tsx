"use client";

import { useEffect, useState, useMemo } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { serviceKoi } from "@/services/koi";
import { GetKoiAuctionResponse, PostKoiAuctionRequest } from "@/types/api/koi";
import {
  Plus,
  Search,
  Trash2,
  Eye,
  Gavel,
  Crown,
  FileIcon,
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { IMAGE_PLACEHOLDER } from "@/constants";
import { EnumGender } from "@/types/enum";
import { FileUpload } from "@/components/file-upload";
import { useRouter } from "next/router";
import { useSocketEvent } from "@/socket/SocketProvider";
import { AuctionNotifyPayload } from "@/socket/types";

export default function KoiAuctions() {
  const [kois, setKois] = useState<GetKoiAuctionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedKoi, setSelectedKoi] = useState<GetKoiAuctionResponse | null>(
    null
  );
  const router = useRouter();
  const auctionId = router.query.auctionId
    ? String(router.query.auctionId)
    : "";

  // Dialog state
  const [openAdd, setOpenAdd] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [gender, setGender] = useState<EnumGender>("M");
  const [length, setLength] = useState<number | "">("");
  const [weight, setWeight] = useState<number | "">("");
  const [price, setPrice] = useState<number | "">("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<string[]>([""]);
  const [certificate, setCertificate] = useState<string>("");

  // datetime-local strings
  const [startAtStr, setStartAtStr] = useState("");
  const [endAtStr, setEndAtStr] = useState("");

  useEffect(() => {
    if (router.isReady) {
      fetchKois();
    }
  }, [router.isReady]);

  const fetchKois = async () => {
    try {
      const response = await serviceKoi.getAuctions();
      setKois(Array.isArray(response) ? response : []);

      if (auctionId) {
        const found = Array.isArray(response)
          ? response.find((k) => k.id === auctionId)
          : null;
        setSelectedKoi(found);
      }
    } catch (error) {
      console.error("Error fetching auctions:", error);
      toast.error("Gagal mengambil data lelang");
    } finally {
      setLoading(false);
    }
  };

  useSocketEvent("admin:auction:notify", () => {
    fetchKois();
  });

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus lelang ini?")) return;
    try {
      await serviceKoi.deleteAuction(id);
      toast.success("Lelang berhasil dihapus");
      fetchKois();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Error deleting auction:", error);
      toast.error(
        error?.response?.data?.responseMessage || "Gagal menghapus lelang"
      );
    }
  };

  const resetForm = () => {
    setName("");
    setType("");
    setGender("M");
    setLength("");
    setWeight("");
    setPrice("");
    setDescription("");
    setImages([""]);
    setCertificate("");
    setStartAtStr("");
    setEndAtStr("");
  };

  const onSubmitAdd = async () => {
    setSaving(true);
    try {
      const imgs = images.map((x) => x.trim()).filter(Boolean);
      const payload: PostKoiAuctionRequest = {
        name: name.trim(),
        type: type.trim(),
        gender,
        length: Number(length),
        weight: Number(weight),
        price: Number(price),
        description: description.trim(),
        images: imgs,
        certificate: certificate.trim() ? certificate.trim() : null,
        startAt: new Date(startAtStr),
        endAt: new Date(endAtStr),
      };
      await serviceKoi.createAuction(
        payload as unknown as Parameters<typeof serviceKoi.createAuction>[0]
      );
      toast.success("Lelang berhasil dibuat");
      setOpenAdd(false);
      resetForm();
      fetchKois();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      console.error(e);
      toast.error(e?.response?.data?.responseMessage || "Gagal membuat lelang");
    } finally {
      setSaving(false);
    }
  };

  const addImageRow = () => setImages((prev) => [...prev, ""]);
  const updateImage = (i: number, url: string) =>
    setImages((prev) => prev.map((v, idx) => (idx === i ? url : v)));
  const removeImage = (i: number) =>
    setImages((prev) => prev.filter((_, idx) => idx !== i));

  const filteredKois = kois.filter(
    (koi) =>
      koi.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      koi.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ---------- Helpers ----------
  const formatRP = (n: number) => `Rp ${n.toLocaleString("id-ID")}`;

  const getLeaderBid = (k: GetKoiAuctionResponse | null) => {
    if (!k || !k.bids || k.bids.length === 0) return null;
    return k.bids.reduce(
      (acc, cur) => (cur.price > acc.price ? cur : acc),
      k.bids[0]
    );
  };

  const getCurrentBid = (koi: GetKoiAuctionResponse) => {
    const leader = getLeaderBid(koi);
    return leader ? leader.price : 0;
  };

  const getBidCount = (koi: GetKoiAuctionResponse) =>
    koi.bids ? koi.bids.length : 0;

  const isWinnerRow = (k: GetKoiAuctionResponse, userId: string) => {
    // gunakan winnerId jika sudah selesai; kalau belum, leader saat ini
    if (k.status === "SELESAI" && k.winnerId) return k.winnerId === userId;
    const leader = getLeaderBid(k);
    return leader ? leader.userId === userId : false;
  };

  const nowLocalInput = () => {
    const d = new Date();
    d.setSeconds(0, 0);
    const pad = (n: number) => String(n).padStart(2, "0");
    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const mi = pad(d.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
  };
  // -----------------------------

  // precompute leader for selected dialog
  const selectedLeader = useMemo(
    () => getLeaderBid(selectedKoi),
    [selectedKoi]
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "AKTIF":
        return <Badge variant="default">Berlangsung</Badge>;
      case "SELESAI":
        return <Badge variant="secondary">Selesai</Badge>;
      case "BELUM_DIMULAI":
        return <Badge variant="outline">Akan Datang</Badge>;
      case "DIHAPUS":
        return <Badge variant="destructive">Dihapus</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Lelang</h2>
            <p className="text-muted-foreground">
              Kelola lelang koi dan aktivitas penawaran
            </p>
          </div>

          {/* Dialog Buat Lelang */}
          <Dialog
            open={openAdd}
            onOpenChange={(o) => {
              setOpenAdd(o);
              if (!o) resetForm();
            }}
          >
            <DialogTrigger asChild>
              <Button onClick={() => setOpenAdd(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Buat Lelang Baru
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Buat Lelang Baru</DialogTitle>
                <DialogDescription>
                  Isi detail untuk membuat lelang koi (Zona waktu Asia/Jakarta).
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nama</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="cth. Tancho Kohaku"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Tipe</Label>
                  <Input
                    id="type"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    placeholder="cth. Kohaku"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Jenis Kelamin</Label>
                  <RadioGroup
                    value={gender}
                    onValueChange={(v) => setGender(v as EnumGender)}
                    className="flex items-center gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem id="g-m" value="M" />
                      <Label htmlFor="g-m">Jantan</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem id="g-f" value="F" />
                      <Label htmlFor="g-f">Betina</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Harga Mulai (Rp)</Label>
                  <Input
                    id="price"
                    type="number"
                    inputMode="numeric"
                    min={0}
                    value={String(price)}
                    onChange={(e) =>
                      setPrice(
                        e.target.value === "" ? "" : Number(e.target.value)
                      )
                    }
                    placeholder="cth. 2000000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="length">Panjang (cm)</Label>
                  <Input
                    id="length"
                    type="number"
                    inputMode="numeric"
                    min={0}
                    value={String(length)}
                    onChange={(e) =>
                      setLength(
                        e.target.value === "" ? "" : Number(e.target.value)
                      )
                    }
                    placeholder="cth. 32"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weight">Berat (g)</Label>
                  <Input
                    id="weight"
                    type="number"
                    inputMode="numeric"
                    min={0}
                    value={String(weight)}
                    onChange={(e) =>
                      setWeight(
                        e.target.value === "" ? "" : Number(e.target.value)
                      )
                    }
                    placeholder="cth. 1100"
                  />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="description">Deskripsi</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Deskripsi singkat..."
                    rows={4}
                  />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Gambar</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addImageRow}
                    >
                      + Tambah Gambar
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {images.map((url, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <FileUpload
                          value={url}
                          onChange={(u) => updateImage(idx, u)}
                          accept="image/*"
                          className="w-full"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeImage(idx)}
                          disabled={images.length === 1}
                          title="Hapus"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="certificate">
                    Sertifikat (opsional)
                  </Label>
                  <FileUpload
                    value={certificate}
                    onChange={(u) => setCertificate(u)}
                    accept="application/pdf"
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startAt">Mulai Pada (Asia/Jakarta)</Label>
                  <Input
                    id="startAt"
                    type="datetime-local"
                    value={startAtStr}
                    onChange={(e) => setStartAtStr(e.target.value)}
                    min={nowLocalInput()}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endAt">Selesai Pada (Asia/Jakarta)</Label>
                  <Input
                    id="endAt"
                    type="datetime-local"
                    value={endAtStr}
                    onChange={(e) => setEndAtStr(e.target.value)}
                    min={startAtStr || nowLocalInput()}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setOpenAdd(false)}
                  disabled={saving}
                >
                  Batal
                </Button>
                <Button onClick={onSubmitAdd} disabled={saving}>
                  {saving ? "Menyimpan..." : "Buat"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gavel className="h-5 w-5" />
              Daftar Lelang
            </CardTitle>
            <CardDescription>
              Semua koi yang tersedia untuk penawaran lelang
            </CardDescription>
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari lelang berdasarkan nama atau tipe..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Memuat...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Gambar</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead>Tipe</TableHead>
                    <TableHead>Jenis Kelamin</TableHead>
                    <TableHead>Ukuran</TableHead>
                    <TableHead>Tawaran Tertinggi</TableHead>
                    <TableHead>Penawar Tertinggi</TableHead>
                    <TableHead>Penawaran</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredKois.map((koi) => {
                    const leader = getLeaderBid(koi);
                    return (
                      <TableRow key={koi.id}>
                        <TableCell>
                          <Image
                            src={koi?.images?.[0] || IMAGE_PLACEHOLDER}
                            alt={koi.name}
                            className="w-12 h-12 object-cover rounded-lg"
                            width={400}
                            height={400}
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          {koi.name}
                        </TableCell>
                        <TableCell>{koi.type}</TableCell>
                        <TableCell>
                          {koi.gender === "M" ? "Jantan" : "Betina"}
                        </TableCell>
                        <TableCell>
                          {koi.length}cm / {koi.weight}g
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {formatRP(getCurrentBid(koi))}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              Mulai: {formatRP(koi.price)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {leader ? (
                            <div className="flex items-center gap-1">
                              <Crown className="h-4 w-4 text-yellow-500" />
                              <span className="text-sm">
                                {leader.user.name}
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {getBidCount(koi)} penawaran
                          </Badge>
                        </TableCell>
                        <TableCell>{getStatusBadge(koi.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Dialog
                              open={selectedKoi?.id === koi.id}
                              onOpenChange={(o) => {
                                if (!o) {
                                  setSelectedKoi(null);
                                  router.push({
                                    pathname: "/admin/koi/auctions",
                                  });
                                }
                              }}
                            >
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedKoi(koi);
                                    router.push({
                                      pathname: "/admin/koi/auctions",
                                      query: { auctionId: koi.id },
                                    });
                                  }}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>{selectedKoi?.name}</DialogTitle>
                                  <DialogDescription>
                                    Detail lelang dan informasi penawaran
                                  </DialogDescription>
                                </DialogHeader>

                                {selectedKoi && (
                                  <div className="space-y-5">
                                    {/* Ringkasan Penawaran */}
                                    <div className="grid grid-cols-2 gap-3">
                                      <Card>
                                        <CardHeader className="pb-2">
                                          <CardTitle className="text-xs text-muted-foreground">
                                            Tawaran Tertinggi
                                          </CardTitle>
                                        </CardHeader>
                                        <CardContent className="pt-0">
                                          <div className="text-base font-semibold">
                                            {formatRP(
                                              getCurrentBid(selectedKoi)
                                            )}
                                          </div>
                                        </CardContent>
                                      </Card>
                                      <Card>
                                        <CardHeader className="pb-2">
                                          <CardTitle className="text-xs text-muted-foreground">
                                            Penawar Tertinggi
                                          </CardTitle>
                                        </CardHeader>
                                        <CardContent className="pt-0">
                                          <div className="text-base font-medium flex items-center gap-1">
                                            {selectedLeader ? (
                                              <>
                                                <Crown className="h-4 w-4 text-yellow-500" />
                                                {selectedLeader.user.name}
                                              </>
                                            ) : (
                                              "—"
                                            )}
                                          </div>
                                        </CardContent>
                                      </Card>
                                      <Card>
                                        <CardHeader className="pb-2">
                                          <CardTitle className="text-xs text-muted-foreground">
                                            Total Penawaran
                                          </CardTitle>
                                        </CardHeader>
                                        <CardContent className="pt-0">
                                          <div className="text-base font-semibold">
                                            {getBidCount(selectedKoi)}
                                          </div>
                                        </CardContent>
                                      </Card>
                                      <Card>
                                        <CardHeader className="pb-2">
                                          <CardTitle className="text-xs text-muted-foreground">
                                            Pemenang
                                          </CardTitle>
                                        </CardHeader>
                                        <CardContent className="pt-0">
                                          <div className="text-base">
                                            {selectedKoi.status === "SELESAI" &&
                                            selectedKoi.winnerId &&
                                            selectedLeader
                                              ? `${
                                                  selectedLeader.user.name
                                                } (${formatRP(
                                                  selectedLeader.price
                                                )})`
                                              : "—"}
                                          </div>
                                        </CardContent>
                                      </Card>
                                    </div>

                                    {/* Meta */}
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <label className="text-sm font-medium">
                                          Tipe
                                        </label>
                                        <p className="text-sm text-muted-foreground">
                                          {selectedKoi.type}
                                        </p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium">
                                          Jenis Kelamin
                                        </label>
                                        <p className="text-sm text-muted-foreground">
                                          {selectedKoi.gender === "M"
                                            ? "Jantan"
                                            : "Betina"}
                                        </p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium">
                                          Panjang
                                        </label>
                                        <p className="text-sm text-muted-foreground">
                                          {selectedKoi.length} cm
                                        </p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium">
                                          Berat
                                        </label>
                                        <p className="text-sm text-muted-foreground">
                                          {selectedKoi.weight} g
                                        </p>
                                      </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <label className="text-sm font-medium">
                                          Harga Mulai
                                        </label>
                                        <p className="text-lg font-bold text-blue-600">
                                          {formatRP(selectedKoi.price)}
                                        </p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium">
                                          Tawaran Tertinggi Saat Ini
                                        </label>
                                        <p className="text-lg font-bold text-green-600">
                                          {formatRP(getCurrentBid(selectedKoi))}
                                        </p>
                                      </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <label className="text-sm font-medium">
                                          Mulai Pada
                                        </label>
                                        <p className="text-sm text-muted-foreground">
                                          {new Date(
                                            selectedKoi.startAt
                                          ).toLocaleString("id-ID")}
                                        </p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium">
                                          Selesai Pada
                                        </label>
                                        <p className="text-sm text-muted-foreground">
                                          {new Date(
                                            selectedKoi.endAt
                                          ).toLocaleString("id-ID")}
                                        </p>
                                      </div>
                                    </div>

                                    <div>
                                      <label className="text-sm font-medium">
                                        Deskripsi
                                      </label>
                                      <p className="text-sm text-muted-foreground mt-1">
                                        {selectedKoi.description}
                                      </p>
                                    </div>

                                    {/* Semua Penawaran */}
                                    <div>
                                      <label className="text-sm font-medium">
                                        Semua Penawaran
                                      </label>
                                      {selectedKoi.bids &&
                                      selectedKoi.bids.length > 0 ? (
                                        <div className="mt-2 space-y-2 max-h-64 overflow-y-auto">
                                          {[...selectedKoi.bids]
                                            .sort((a, b) => b.price - a.price)
                                            .map((bid) => {
                                              const winnerRow = isWinnerRow(
                                                selectedKoi,
                                                bid.userId
                                              );
                                              return (
                                                <div
                                                  key={bid.id}
                                                  className={`flex justify-between items-center p-2 rounded border ${
                                                    winnerRow
                                                      ? "bg-green-50 border-green-200"
                                                      : "bg-gray-50"
                                                  }`}
                                                >
                                                  <div>
                                                    <p className="font-medium flex items-center gap-1">
                                                      {winnerRow && (
                                                        <Crown className="h-4 w-4 text-green-600" />
                                                      )}
                                                      {bid.user.name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                      {new Date(
                                                        bid.createdAt
                                                      ).toLocaleString("id-ID")}
                                                    </p>
                                                  </div>
                                                  <p className="font-bold text-green-700">
                                                    {formatRP(bid.price)}
                                                  </p>
                                                </div>
                                              );
                                            })}
                                        </div>
                                      ) : (
                                        <p className="text-sm text-muted-foreground mt-2">
                                          Belum ada penawaran.
                                        </p>
                                      )}
                                    </div>

                                    {selectedKoi.images.length > 0 && (
                                      <div>
                                        <label className="text-sm font-medium">
                                          Gambar
                                        </label>
                                        <div className="grid grid-cols-3 gap-2 mt-2">
                                          {selectedKoi.images.map(
                                            (image, index) => (
                                              <Image
                                                key={index}
                                                src={image}
                                                alt={`${selectedKoi.name} ${
                                                  index + 1
                                                }`}
                                                className="w-full h-24 object-cover rounded-lg"
                                                width={400}
                                                height={400}
                                              />
                                            )
                                          )}
                                        </div>
                                      </div>
                                    )}
                                    <div>
                                      <label className="text-sm font-medium">
                                        Sertifikat
                                      </label>
                                      <div className="grid grid-cols-3 gap-2 mt-2">
                                        {selectedKoi.certificate ? (
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                              window.open(
                                                selectedKoi.certificate || "",
                                                "_blank"
                                              );
                                            }}
                                          >
                                            <FileIcon className="h-4 w-4" />
                                            Lihat Sertifikat
                                          </Button>
                                        ) : (
                                          <p className="text-sm text-muted-foreground mt-2">
                                            Tidak ada sertifikat.
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(koi.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
