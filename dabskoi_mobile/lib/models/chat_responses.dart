import 'koi_responses.dart';

class ChatResponse {
  final ChatUser user;
  final List<ChatMessage> messages;

  const ChatResponse({required this.user, required this.messages});

  factory ChatResponse.fromJson(Map<String, dynamic> json) {
    final msgs = <ChatMessage>[];
    if (json['messages'] is List) {
      for (final e in (json['messages'] as List)) {
        if (e is Map<String, dynamic>) {
          msgs.add(ChatMessage.fromJson(e));
        }
      }
    }

    return ChatResponse(
      user: ChatUser.fromJson(
        json['user'] as Map<String, dynamic>? ?? const {},
      ),
      messages: msgs,
    );
  }
}

/// ====== Entities ======

class ChatUser {
  final String id;
  final String name;
  final String? picture;

  const ChatUser({required this.id, required this.name, required this.picture});

  factory ChatUser.fromJson(Map<String, dynamic> json) {
    return ChatUser(
      id: json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? '',
      picture: json['picture'] == null ? null : json['picture'].toString(),
    );
  }
}

class ChatMessage {
  final String id;
  final ChatMessageType type;
  final ChatContent chat;
  final ChatRole role;
  final bool readByAdmin;
  final bool readByUser;
  final ChatUser? user;
  final DateTime createdAt;

  const ChatMessage({
    required this.id,
    required this.type,
    required this.chat,
    required this.role,
    required this.readByAdmin,
    required this.readByUser,
    required this.user,
    required this.createdAt,
  });

  factory ChatMessage.fromJson(Map<String, dynamic> json) {
    // helper parse tanggal (konsisten seperti KoiResponse)
    DateTime _parseDate(dynamic v) {
      if (v == null) return DateTime.fromMillisecondsSinceEpoch(0);
      if (v is String) {
        return DateTime.tryParse(v) ?? DateTime.fromMillisecondsSinceEpoch(0);
      }
      if (v is int) return DateTime.fromMillisecondsSinceEpoch(v);
      return DateTime.fromMillisecondsSinceEpoch(0);
    }

    return ChatMessage(
      id: json['id']?.toString() ?? '',
      type: ChatMessageTypeX.fromBackend(json['type']),
      chat: ChatContent.fromJson(
        json['chat'] as Map<String, dynamic>? ?? const {},
      ),
      role: ChatRoleX.fromBackend(json['role']),
      readByAdmin: (json['readByAdmin'] as bool?) ?? false,
      readByUser: (json['readByUser'] as bool?) ?? false,
      user: (json['user'] is Map<String, dynamic>)
          ? ChatUser.fromJson(json['user'] as Map<String, dynamic>)
          : null,
      createdAt: _parseDate(json['createdAt']),
    );
  }
}

class ChatContent {
  final ChatProduct? product;
  final String content;
  final String? reference;

  const ChatContent({
    required this.product,
    required this.content,
    required this.reference,
  });

  factory ChatContent.fromJson(Map<String, dynamic> json) {
    return ChatContent(
      product: (json['product'] is Map<String, dynamic>)
          ? ChatProduct.fromJson(json['product'] as Map<String, dynamic>)
          : null,
      content: json['content']?.toString() ?? '',
      reference: json['reference'] == null
          ? null
          : json['reference'].toString(),
    );
  }
}

class ChatProduct {
  final String id;
  final String name;
  final List<String> images;
  final ChatProductType type;
  final KoiGender gender;
  final num length; // cm
  final num weight; // g
  final num price; // Rupiah
  final String description;
  final String? certificate;

  const ChatProduct({
    required this.id,
    required this.name,
    required this.images,
    required this.type,
    required this.gender,
    required this.length,
    required this.weight,
    required this.price,
    required this.description,
    required this.certificate,
  });

  factory ChatProduct.fromJson(Map<String, dynamic> json) {
    final imgs = (json['images'] is List)
        ? (json['images'] as List)
              .map((e) => e?.toString() ?? '')
              .where((e) => e.isNotEmpty)
              .toList()
        : <String>[];

    return ChatProduct(
      id: json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? '',
      images: imgs,
      type: ChatProductTypeX.fromBackend(json['type']),
      gender: KoiGenderX.fromBackend(json['gender']),
      length: (json['length'] as num?) ?? 0,
      weight: (json['weight'] as num?) ?? 0,
      price: (json['price'] as num?) ?? 0,
      description: json['description']?.toString() ?? '',
      certificate: json['certificate'] == null
          ? null
          : json['certificate'].toString(),
    );
  }
}

/// ====== Enums & Extensions ======

enum ChatMessageType {
  TEXT,
  IMAGE,
  REFERENCE_SELL,
  REFERENCE_NEGO,
  REFERENCE_AUCTION,
  NEGO_RESPONSE_ACCEPT,
  NEGO_RESPONSE_REJECT,
  NEGO_REQUEST,
  AUCTION_RESPONSE_ACCEPT,
  AUCTION_RESPONSE_REJECT,
}

extension ChatMessageTypeX on ChatMessageType {
  static ChatMessageType fromBackend(dynamic v) {
    switch (v?.toString().toUpperCase()) {
      case 'IMAGE':
        return ChatMessageType.IMAGE;
      case 'REFERENCE_SELL':
        return ChatMessageType.REFERENCE_SELL;
      case 'REFERENCE_NEGO':
        return ChatMessageType.REFERENCE_NEGO;
      case 'REFERENCE_AUCTION':
        return ChatMessageType.REFERENCE_AUCTION;
      case 'NEGO_RESPONSE_ACCEPT':
        return ChatMessageType.NEGO_RESPONSE_ACCEPT;
      case 'NEGO_RESPONSE_REJECT':
        return ChatMessageType.NEGO_RESPONSE_REJECT;
      case 'NEGO_REQUEST':
        return ChatMessageType.NEGO_REQUEST;
      case 'AUCTION_RESPONSE_ACCEPT':
        return ChatMessageType.AUCTION_RESPONSE_ACCEPT;
      case 'AUCTION_RESPONSE_REJECT':
        return ChatMessageType.AUCTION_RESPONSE_REJECT;
      default:
        return ChatMessageType.TEXT;
    }
  }

  String get label {
    switch (this) {
      case ChatMessageType.TEXT:
        return 'Teks';
      case ChatMessageType.IMAGE:
        return 'Gambar';
      case ChatMessageType.REFERENCE_SELL:
        return 'Referensi Jual';
      case ChatMessageType.REFERENCE_NEGO:
        return 'Referensi Nego';
      case ChatMessageType.REFERENCE_AUCTION:
        return 'Referensi Lelang';
      case ChatMessageType.NEGO_RESPONSE_ACCEPT:
        return 'Nego Diterima';
      case ChatMessageType.NEGO_RESPONSE_REJECT:
        return 'Nego Ditolak';
      case ChatMessageType.NEGO_REQUEST:
        return 'Permintaan Nego';
      case ChatMessageType.AUCTION_RESPONSE_ACCEPT:
        return 'Lelang Diterima';
      case ChatMessageType.AUCTION_RESPONSE_REJECT:
        return 'Lelang Ditolak';
    }
  }

  String get backend => toString().split('.').last; // TEXT, IMAGE, ...
}

enum ChatRole { USER, ADMIN }

extension ChatRoleX on ChatRole {
  static ChatRole fromBackend(dynamic v) {
    return v?.toString().toUpperCase() == 'ADMIN'
        ? ChatRole.ADMIN
        : ChatRole.USER;
  }

  String get label => this == ChatRole.ADMIN ? 'Admin' : 'Pengguna';
  String get backend => this == ChatRole.ADMIN ? 'ADMIN' : 'USER';
}

enum ChatProductType { NEGO, AUCTION, SELL }

extension ChatProductTypeX on ChatProductType {
  static ChatProductType fromBackend(dynamic v) {
    switch (v?.toString().toUpperCase()) {
      case 'NEGO':
        return ChatProductType.NEGO;
      case 'AUCTION':
        return ChatProductType.AUCTION;
      default:
        return ChatProductType.SELL;
    }
  }

  String get label {
    switch (this) {
      case ChatProductType.NEGO:
        return 'Nego';
      case ChatProductType.AUCTION:
        return 'Lelang';
      case ChatProductType.SELL:
        return 'Jual';
    }
  }

  String get backend {
    switch (this) {
      case ChatProductType.NEGO:
        return 'NEGO';
      case ChatProductType.AUCTION:
        return 'AUCTION';
      case ChatProductType.SELL:
        return 'SELL';
    }
  }
}
