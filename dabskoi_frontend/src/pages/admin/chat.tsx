"use client";

import { useEffect, useMemo, useState } from "react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { serviceChat } from "@/services/chat";
import { GetAllRoomChatResponse, GetChatResponse } from "@/types/api/chat";
import {
  MessageSquare,
  Search,
  Send,
  Image as ImageIcon,
  DeleteIcon,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { IMAGE_PLACEHOLDER } from "@/constants";
import { EnumChatType } from "@/types/enum";

// 👉 IMPORT tipe & hook socket
import { useSocketEvent } from "@/socket/SocketProvider";
import type { AdminNewEnvelope, UnreadEnvelope } from "@/socket/types";
import { useRouter } from "next/router";
import { serviceImage } from "@/services/image";

export default function AdminChat() {
  const [chatRooms, setChatRooms] = useState<GetAllRoomChatResponse[]>([]);
  const [selectedChat, setSelectedChat] = useState<GetChatResponse | null>(
    null
  );
  const [selectedRoomId, setSelectedRoomId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    console.log("handleImageUpload");
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      setUploading(true);

      const formData = new FormData();
      formData.append("image", file);
      const res = await serviceImage.upload(file);
      const url = res.path;
      setImage(url);
    } catch (error) {
      console.error(error);
      toast.error("Terjadi error saat mengupload file");
    } finally {
      setUploading(false);
    }
  };

  const router = useRouter();
  const userId = router.query.userId ? String(router.query.userId) : "";

  // ---------- Helpers untuk update state dari event ----------
  const upsertRoomPreview = (payload: {
    userId: string;
    lastContent: string;
    lastType: EnumChatType | string;
    lastDateISO: string | Date;
    unread?: number;
  }) => {
    setChatRooms((prev) => {
      const idx = prev.findIndex((r) => r.id === payload.userId);
      const createdAt =
        typeof payload.lastDateISO === "string"
          ? new Date(payload.lastDateISO)
          : payload.lastDateISO;

      if (idx === -1) {
        const draft: GetAllRoomChatResponse = {
          id: payload.userId,
          name: "Pengguna Tidak Dikenal",
          picture: "",
          chat: {
            content: payload.lastContent,
            createdAt,
            unread: payload.unread ?? 1,
            type: (payload.lastType as EnumChatType) ?? "TEXT",
          },
        };
        return [draft, ...prev];
      }

      const next = [...prev];
      const current = next[idx];
      const updated: GetAllRoomChatResponse = {
        ...current,
        chat: {
          ...current.chat,
          content: payload.lastContent,
          type: (payload.lastType as EnumChatType) ?? current.chat.type,
          createdAt,
          unread:
            typeof payload.unread === "number"
              ? payload.unread
              : current.chat.unread,
        },
      };

      next.splice(idx, 1);
      return [updated, ...next];
    });
  };

  const mergeUnreadCount = (userId: string, unread: number) => {
    setChatRooms((prev) =>
      prev.map((r) =>
        r.id === userId ? { ...r, chat: { ...r.chat, unread } } : r
      )
    );
  };

  const appendToSelectedIfOpen = (
    userId: string,
    message: GetChatResponse["messages"][number]
  ) => {
    setSelectedChat((prev) => {
      if (!prev || prev.user.id !== userId) return prev;
      return {
        ...prev,
        messages: [message, ...prev.messages],
      };
    });
  };

  // ---------- Socket Event Handlers ----------
  useSocketEvent("admin:chat:new", ({ userId, message }: AdminNewEnvelope) => {
    upsertRoomPreview({
      userId,
      lastContent: message.chat.content,
      lastType: message.type,
      lastDateISO: message.createdAt,
    });

    appendToSelectedIfOpen(userId, {
      id: message.id,
      type: message.type as EnumChatType,
      chat: {
        product: message.chat.product,
        content: message.chat.content,
        reference: message.chat.reference,
      },
      role: message.role === "ADMIN" ? "ADMIN" : "USER",
      readByAdmin: message.readByAdmin,
      readByUser: message.readByUser,
      user:
        message.role === "USER"
          ? {
              id: message.user?.id || userId,
              name: message.user?.name || "",
              picture: message.user?.picture || null,
            }
          : null,
      createdAt: new Date(message.createdAt),
    });
  });

  useSocketEvent(
    "admin:unreadCount",
    ({ userId, unread, lastMessage }: UnreadEnvelope) => {
      mergeUnreadCount(userId, unread);
      if (lastMessage) {
        upsertRoomPreview({
          userId,
          lastContent: lastMessage.chat.content,
          lastType: lastMessage.type,
          lastDateISO: lastMessage.createdAt,
          unread,
        });
      }
    }
  );

  // ---------- Initial fetch ----------
  useEffect(() => {
    if (router.isReady) {
      fetchChatRooms();
    }
  }, [router.isReady]);

  const fetchChatRooms = async () => {
    try {
      const response = await serviceChat.getChats();
      setChatRooms(Array.isArray(response) ? response : []);
      if (userId) {
        fetchChatMessages(userId);
      }
    } catch (error) {
      console.error("Error fetching chat rooms:", error);
      toast.error("Gagal mengambil daftar chat");
    } finally {
      setLoading(false);
    }
  };

  const fetchChatMessages = async (userId: string) => {
    try {
      const response = await serviceChat.getChatByUser(userId);
      setSelectedChat(response);
      setSelectedRoomId(userId);
      if (userId) {
        router.push({
          pathname: "/admin/chat",
          query: { userId },
        });
      }
      mergeUnreadCount(userId, 0);
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      toast.error("Gagal mengambil pesan chat");
    }
  };

  const sendMessage = async () => {
    if ((!newMessage.trim() && !image) || !selectedRoomId) return;
    try {
      await serviceChat.sendMessage({
        userId: selectedRoomId,
        content: image || newMessage,
        type: image ? "IMAGE" : "TEXT",
      });
      setNewMessage("");
      setImage(null);
      fetchChatMessages(selectedRoomId);
      toast.success("Pesan berhasil dikirim");
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Gagal mengirim pesan");
    }
  };

  const filteredChatRooms = useMemo(
    () =>
      chatRooms.filter((room) =>
        room.name.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [chatRooms, searchTerm]
  );

  const getChatTypeIcon = (type: string) => {
    switch (type) {
      case "IMAGE":
        return <ImageIcon className="h-4 w-4" />;
      case "REFERENCE_SELL":
      case "REFERENCE_NEGO":
      case "REFERENCE_AUCTION":
        return <MessageSquare className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Manajemen Chat</h2>
          <p className="text-muted-foreground">
            Pantau dan kelola percakapan pelanggan
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Daftar Chat */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Daftar Chat
              </CardTitle>
              <CardDescription>
                Percakapan aktif dengan pelanggan
              </CardDescription>
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari percakapan..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[500px]">
                {loading ? (
                  <div className="text-center py-8">Memuat...</div>
                ) : (
                  <div className="space-y-1">
                    {filteredChatRooms.map((room) => (
                      <div
                        key={room.id}
                        className={`p-4 cursor-pointer hover:bg-accent transition-colors border-b ${
                          selectedRoomId === room.id ? "bg-accent" : ""
                        }`}
                        onClick={() => fetchChatMessages(room.id)}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage
                              src={room.picture || ""}
                              alt={room.name}
                            />
                            <AvatarFallback>
                              {room.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="font-medium truncate">
                                {room.name}
                              </p>
                              {room.chat.unread > 0 && (
                                <Badge
                                  variant="destructive"
                                  className="text-xs"
                                >
                                  {room.chat.unread}
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              {getChatTypeIcon(room.chat.type)}
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                {room.chat.type === "IMAGE"
                                  ? "Gambar"
                                  : room.chat.content}
                              </p>
                            </div>
                            {room.chat.createdAt && (
                              <p className="text-xs text-muted-foreground">
                                {new Date(room.chat.createdAt).toLocaleString(
                                  "id-ID"
                                )}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Pesan */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>
                {selectedChat
                  ? `Chat dengan ${selectedChat.user.name}`
                  : "Pilih percakapan"}
              </CardTitle>
              <CardDescription>
                {selectedChat
                  ? "Lihat dan balas pesan"
                  : "Pilih salah satu percakapan untuk melihat pesan"}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col h-[500px] overflow-clip">
              {selectedChat ? (
                <>
                  <ScrollArea className="flex-1 pr-4 overflow-y-auto">
                    <div className="space-y-4">
                      {selectedChat.messages.map((message) => (
                        <BubbleChat
                          key={message.id}
                          message={message}
                          refetch={fetchChatMessages}
                        />
                      ))}
                    </div>
                  </ScrollArea>

                  <div className="flex items-center gap-2  mt-4 pt-4 border-t">
                    {image ? (
                      <Image
                        src={image}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg border"
                        width={600}
                        height={600}
                      />
                    ) : (
                      <Input
                        placeholder="Tulis pesan..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                        className="flex-1"
                      />
                    )}
                    <input
                      className="hidden"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      id="image-upload"
                    />
                    {image && (
                      <Button
                        onClick={() => setImage(null)}
                        disabled={uploading}
                      >
                        <DeleteIcon className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      onClick={() =>
                        document.getElementById("image-upload")?.click()
                      }
                      disabled={uploading}
                    >
                      {uploading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <ImageIcon className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      onClick={sendMessage}
                      disabled={(!newMessage.trim() && !image) || uploading}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Pilih percakapan untuk mulai mengobrol</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}

const BubbleChat = ({
  message,
  refetch,
}: {
  message: GetChatResponse["messages"][number];
  refetch: (userId: string) => void;
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleReplyNego = async (isAccept: boolean) => {
    try {
      if (isLoading) return;
      setIsLoading(true);
      await serviceChat.replyNegoRequest({
        messageId: message.id,
        isAccept,
      });
      refetch(message.user?.id || "");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.log(error);
      toast.error(
        error?.response?.data?.responseMessage ||
          "Gagal membalas permintaan nego"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getChatTypeBadge = (type: EnumChatType) => {
    switch (type) {
      case "NEGO_REQUEST":
        return <Badge variant="outline">Permintaan Nego</Badge>;
      case "NEGO_RESPONSE_ACCEPT":
        return <Badge variant="default">Diterima</Badge>;
      case "NEGO_RESPONSE_REJECT":
        return <Badge variant="destructive">Ditolak</Badge>;
      case "AUCTION_RESPONSE_ACCEPT":
        return <Badge variant="default">Lelang Diterima</Badge>;
      case "AUCTION_RESPONSE_REJECT":
        return <Badge variant="destructive">Lelang Ditolak</Badge>;
      case "REFERENCE_SELL":
        return <Badge variant="secondary">Referensi Jual</Badge>;
      case "REFERENCE_NEGO":
        return <Badge variant="secondary">Referensi Nego</Badge>;
      case "REFERENCE_AUCTION":
        return <Badge variant="secondary">Referensi Lelang</Badge>;
      default:
        return null;
    }
  };

  return (
    <div
      className={`flex ${
        message.role === "ADMIN" ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`max-w-[70%] rounded-lg p-3 ${
          message.role === "ADMIN"
            ? "bg-blue-600 text-white"
            : "bg-gray-100 text-gray-900"
        }`}
      >
        <div className="flex items-center gap-2 mb-1">
          {message.user && (
            <Avatar className="h-6 w-6">
              <AvatarImage
                src={message.user.picture || ""}
                alt={message.user.name}
              />
              <AvatarFallback className="text-xs">
                {message.user.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
          )}
          <span className="text-xs opacity-75">
            {message.user?.name || "Admin"}
          </span>
          {getChatTypeBadge(message.type)}
        </div>

        {message.chat.product && (
          <div className="mb-2 p-2 bg-white/10 rounded border">
            <div className="flex items-center gap-2">
              {message.chat.product.images.length > 0 && (
                <Image
                  src={message?.chat?.product?.images?.[0] || IMAGE_PLACEHOLDER}
                  alt={message.chat.product.name}
                  className="w-12 h-12 object-cover rounded"
                  width={400}
                  height={400}
                />
              )}
              <div>
                <p className="font-medium text-sm">
                  {message.chat.product.name}
                </p>
                <p className="text-xs opacity-75">
                  Rp {message.chat.product.price.toLocaleString("id-ID")}
                </p>
              </div>
            </div>
          </div>
        )}

        {message.type === "NEGO_REQUEST" && (
          <div className="w-full flex flex-col mb-2">
            {message.readByAdmin ? null : (
              <div className="flex flex-row justify-between gap-2 w-full">
                <Button
                  className="flex-1"
                  variant="default"
                  onClick={() => handleReplyNego(true)}
                >
                  Terima
                </Button>
                <Button
                  className="flex-1"
                  variant="destructive"
                  onClick={() => handleReplyNego(false)}
                >
                  Tolak
                </Button>
              </div>
            )}
          </div>
        )}

        {message.type === "IMAGE" ? (
          <div className="flex items-center justify-center">
            <Image
              src={message?.chat?.content || IMAGE_PLACEHOLDER}
              alt={message.chat.content}
              className="w-full h-full object-contain rounded-xl"
              width={400}
              height={400}
            />
          </div>
        ) : (
          <p className="text-sm w-full">{message.chat.content}</p>
        )}
        <p className="text-xs opacity-75 mt-1">
          {new Date(message.createdAt).toLocaleString("id-ID")}
        </p>
      </div>
    </div>
  );
};
