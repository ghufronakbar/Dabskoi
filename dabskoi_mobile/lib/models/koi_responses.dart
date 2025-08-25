// lib/models/koi_responses.dart

class KoiResponse {
  final String id;
  final String name;
  final String type;
  final KoiGender gender;
  final num length; // cm
  final num weight; // g
  final num price; // Rupiah
  final String description;
  final List<String> images;
  final String? certificate;
  final KoiStatus status;
  final DateTime createdAt;
  final DateTime updatedAt;
  final String? winnerId;

  /// Khusus AUCTION (sell/nego -> null)
  final DateTime? startAt;
  final DateTime? endAt;
  final num? highestBid;

  /// Opsional, hanya ada pada AUCTION. Default [] untuk tipe selainnya.
  final List<KoiAuctionBid> bids;

  const KoiResponse({
    required this.id,
    required this.name,
    required this.type,
    required this.gender,
    required this.length,
    required this.weight,
    required this.price,
    required this.description,
    required this.images,
    required this.certificate,
    required this.status,
    required this.createdAt,
    required this.updatedAt,
    required this.winnerId,
    this.startAt,
    this.endAt,
    this.highestBid,
    this.bids = const <KoiAuctionBid>[],
  });

  factory KoiResponse.fromJson(Map<String, dynamic> json) {
    // helper parse tanggal
    DateTime _parseDate(dynamic v) {
      if (v == null) return DateTime.fromMillisecondsSinceEpoch(0);
      if (v is String)
        return DateTime.tryParse(v) ?? DateTime.fromMillisecondsSinceEpoch(0);
      if (v is int) return DateTime.fromMillisecondsSinceEpoch(v);
      return DateTime.fromMillisecondsSinceEpoch(0);
    }

    // images bisa null / non-list
    final imgs = (json['images'] is List)
        ? (json['images'] as List)
              .map((e) => e?.toString() ?? '')
              .where((e) => e.isNotEmpty)
              .toList()
        : <String>[];

    // bids opsional
    final bidList = (json['bids'] is List)
        ? (json['bids'] as List)
              .whereType<Map<String, dynamic>>()
              .map((e) => KoiAuctionBid.fromJson(e))
              .toList()
        : <KoiAuctionBid>[];

    return KoiResponse(
      id: json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? '',
      type: json['type']?.toString() ?? '',
      gender: KoiGenderX.fromBackend(json['gender']),
      length: (json['length'] as num?) ?? 0,
      weight: (json['weight'] as num?) ?? 0,
      price: (json['price'] as num?) ?? 0,
      description: json['description']?.toString() ?? '',
      images: imgs,
      certificate: json['certificate'] == null
          ? null
          : json['certificate'].toString(),
      status: KoiStatusX.fromBackend(json['status']),
      createdAt: _parseDate(json['createdAt']),
      updatedAt: _parseDate(json['updatedAt']),
      winnerId: json['winnerId']?.toString(),
      startAt: json.containsKey('startAt')
          ? _parseNullableDate(json['startAt'])
          : null,
      endAt: json.containsKey('endAt')
          ? _parseNullableDate(json['endAt'])
          : null,
      highestBid: (json['highestBid'] as num?) ?? 0, // tetap konsisten dgnmu
      bids: bidList,
    );
  }

  static DateTime? _parseNullableDate(dynamic v) {
    if (v == null) return null;
    if (v is String) return DateTime.tryParse(v);
    if (v is int) return DateTime.fromMillisecondsSinceEpoch(v);
    return null;
  }
}

class KoiAuctionBid {
  final String id;
  final num price;
  final String koiAuctionId;
  final String userId;
  final DateTime createdAt;
  final DateTime updatedAt;

  /// subset aman dari user (abaikan email/password demi keamanan)
  final KoiBidUser? user;

  const KoiAuctionBid({
    required this.id,
    required this.price,
    required this.koiAuctionId,
    required this.userId,
    required this.createdAt,
    required this.updatedAt,
    this.user,
  });

  factory KoiAuctionBid.fromJson(Map<String, dynamic> json) {
    DateTime _parseDate(dynamic v) {
      if (v == null) return DateTime.fromMillisecondsSinceEpoch(0);
      if (v is String)
        return DateTime.tryParse(v) ?? DateTime.fromMillisecondsSinceEpoch(0);
      if (v is int) return DateTime.fromMillisecondsSinceEpoch(v);
      return DateTime.fromMillisecondsSinceEpoch(0);
    }

    final userJson = json['user'];
    return KoiAuctionBid(
      id: json['id']?.toString() ?? '',
      price: (json['price'] as num?) ?? 0,
      koiAuctionId: json['koiAuctionId']?.toString() ?? '',
      userId: json['userId']?.toString() ?? '',
      createdAt: _parseDate(json['createdAt']),
      updatedAt: _parseDate(json['updatedAt']),
      user: (userJson is Map<String, dynamic>)
          ? KoiBidUser.fromJson(userJson)
          : null,
    );
  }
}

class KoiBidUser {
  final String id;
  final String name;
  final String? picture;

  const KoiBidUser({required this.id, required this.name, this.picture});

  factory KoiBidUser.fromJson(Map<String, dynamic> json) {
    return KoiBidUser(
      id: json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? '',
      picture: json['picture'] == null ? null : json['picture'].toString(),
    );
  }
}

enum KoiGender { male, female }

extension KoiGenderX on KoiGender {
  static KoiGender fromBackend(dynamic v) {
    final s = v?.toString().toUpperCase();
    return s == 'F' ? KoiGender.female : KoiGender.male; // default M
  }

  String get label => this == KoiGender.male ? 'Jantan' : 'Betina';
  String get backend => this == KoiGender.male ? 'M' : 'F';
}

enum KoiStatus { AKTIF, SELESAI, BELUM_DIMULAI, DIHAPUS }

extension KoiStatusX on KoiStatus {
  static KoiStatus fromBackend(dynamic v) {
    switch (v?.toString().toUpperCase()) {
      case 'SELESAI':
        return KoiStatus.SELESAI;
      case 'BELUM_DIMULAI':
        return KoiStatus.BELUM_DIMULAI;
      case 'DIHAPUS':
        return KoiStatus.DIHAPUS;
      default:
        return KoiStatus.AKTIF;
    }
  }

  String get label {
    switch (this) {
      case KoiStatus.AKTIF:
        return 'Aktif';
      case KoiStatus.SELESAI:
        return 'Selesai';
      case KoiStatus.BELUM_DIMULAI:
        return 'Belum Dimulai';
      case KoiStatus.DIHAPUS:
        return 'Dihapus';
    }
  }
}
