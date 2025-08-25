"use client";

import { useEffect, useState } from "react";
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
import { GetKoiNegoResponse } from "@/types/api/koi";
import { Plus, Search, Trash2, Eye, HandHeart, FileIcon } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { IMAGE_PLACEHOLDER } from "@/constants";
import { EnumGender } from "@/types/enum";
import { FileUpload } from "@/components/file-upload";

export default function KoiNegotiations() {
  const [kois, setKois] = useState<GetKoiNegoResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedKoi, setSelectedKoi] = useState<GetKoiNegoResponse | null>(
    null
  );

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

  useEffect(() => {
    fetchKois();
  }, []);

  const fetchKois = async () => {
    try {
      const response = await serviceKoi.getNegos();
      setKois(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error("Error fetching negotiations:", error);
      toast.error("Gagal mengambil data negosiasi");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus negosiasi ini?")) return;
    try {
      await serviceKoi.deleteNego(id);
      toast.success("Negosiasi berhasil dihapus");
      fetchKois();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Error deleting negotiation:", error);
      toast.error(
        error?.response?.data?.responseMessage || "Gagal menghapus negosiasi"
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
  };

  const onSubmitAdd = async () => {
    try {
      setSaving(true);
      const imgs = images.map((x) => x.trim()).filter(Boolean);
      const payload: Parameters<typeof serviceKoi.createNego>[0] = {
        name: name.trim(),
        type: type.trim(),
        gender,
        length: Number(length),
        weight: Number(weight),
        price: Number(price),
        description: description.trim(),
        images: imgs,
        certificate: certificate.trim() ? certificate.trim() : null,
      };

      await serviceKoi.createNego(payload);
      toast.success("Negosiasi berhasil dibuat");
      setOpenAdd(false);
      resetForm();
      fetchKois();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      console.error(e);
      toast.error(
        e?.response?.data?.responseMessage || "Gagal membuat negosiasi"
      );
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "AKTIF":
        return <Badge variant="default">Aktif</Badge>;
      case "SELESAI":
        return <Badge variant="secondary">Selesai</Badge>;
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
            <h2 className="text-3xl font-bold tracking-tight">Negosiasi</h2>
            <p className="text-muted-foreground">
              Kelola listing koi yang tersedia untuk negosiasi harga
            </p>
          </div>

          {/* Dialog Tambah Negosiasi */}
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
                Tambah Negosiasi Baru
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Tambah Negosiasi Baru</DialogTitle>
                <DialogDescription>
                  Isi detail untuk membuat listing negosiasi.
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nama</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="cth. Showa Sanshoku"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Tipe</Label>
                  <Input
                    id="type"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    placeholder="cth. Showa"
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
                  <Label htmlFor="price">Harga Awal (Rp)</Label>
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
                    placeholder="cth. 2500000"
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
                    placeholder="cth. 35"
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
                    placeholder="cth. 1200"
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
              <HandHeart className="h-5 w-5" />
              Daftar Negosiasi
            </CardTitle>
            <CardDescription>
              Semua koi yang tersedia untuk negosiasi harga
            </CardDescription>
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari negosiasi berdasarkan nama atau tipe..."
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
                    <TableHead>Harga Awal</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredKois.map((koi) => (
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
                      <TableCell className="font-medium">{koi.name}</TableCell>
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
                            Rp {koi.price.toLocaleString("id-ID")}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Harga awal
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(koi.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedKoi(koi)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>{selectedKoi?.name}</DialogTitle>
                                <DialogDescription>
                                  Detail dan informasi negosiasi
                                </DialogDescription>
                              </DialogHeader>
                              {selectedKoi && (
                                <div className="space-y-4">
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
                                  <div>
                                    <label className="text-sm font-medium">
                                      Deskripsi
                                    </label>
                                    <p className="text-sm text-muted-foreground mt-1">
                                      {selectedKoi.description}
                                    </p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">
                                      Harga Awal
                                    </label>
                                    <p className="text-lg font-bold text-green-600">
                                      Rp{" "}
                                      {selectedKoi.price.toLocaleString(
                                        "id-ID"
                                      )}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      Terbuka untuk negosiasi
                                    </p>
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
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
