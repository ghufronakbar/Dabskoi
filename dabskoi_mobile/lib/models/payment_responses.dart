class PaymentResponse {
  final String id;
  final String userId;
  final PaymentType type;
  final String reference;
  final num amount;
  final PaymentStatus status;
  final String? midtransDirectUrl;
  final DateTime createdAt;
  final DateTime updatedAt;
  final DateTime? expiredAt;
  final PaymentProduct product;

  const PaymentResponse({
    required this.id,
    required this.userId,
    required this.type,
    required this.reference,
    required this.amount,
    required this.status,
    required this.midtransDirectUrl,
    required this.createdAt,
    required this.updatedAt,
    required this.expiredAt,
    required this.product,
  });

  factory PaymentResponse.fromJson(Map<String, dynamic> json) {
    DateTime _parseDate(dynamic v) {
      if (v == null) return DateTime.fromMillisecondsSinceEpoch(0);
      if (v is String) {
        return DateTime.tryParse(v) ?? DateTime.fromMillisecondsSinceEpoch(0);
      }
      if (v is int) return DateTime.fromMillisecondsSinceEpoch(v);
      return DateTime.fromMillisecondsSinceEpoch(0);
    }

    DateTime? _parseNullableDate(dynamic v) {
      if (v == null) return null;
      if (v is String) return DateTime.tryParse(v);
      if (v is int) return DateTime.fromMillisecondsSinceEpoch(v);
      return null;
    }

    return PaymentResponse(
      id: json['id']?.toString() ?? '',
      userId: json['userId']?.toString() ?? '',
      type: PaymentTypeX.fromBackend(json['type']),
      reference: json['reference']?.toString() ?? '',
      amount: (json['amount'] as num?) ?? 0,
      status: PaymentStatusX.fromBackend(json['status']),
      midtransDirectUrl: json['midtransDirectUrl']?.toString(),
      createdAt: _parseDate(json['createdAt']),
      updatedAt: _parseDate(json['updatedAt']),
      expiredAt: _parseNullableDate(json['expiredAt']),
      product: PaymentProduct.fromJson(
        (json['product'] is Map<String, dynamic>)
            ? json['product'] as Map<String, dynamic>
            : <String, dynamic>{},
      ),
    );
  }
}

class PaymentProduct {
  final String id;
  final String name;
  final List<String> images;
  final PaymentType type;
  final num price;

  const PaymentProduct({
    required this.id,
    required this.name,
    required this.images,
    required this.type,
    required this.price,
  });

  factory PaymentProduct.fromJson(Map<String, dynamic> json) {
    final imgs = (json['images'] is List)
        ? (json['images'] as List)
              .map((e) => e?.toString() ?? '')
              .where((e) => e.isNotEmpty)
              .toList()
        : <String>[];

    return PaymentProduct(
      id: json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? '',
      images: imgs,
      type: PaymentTypeX.fromBackend(json['type']),
      price: (json['price'] as num?) ?? 0,
    );
  }
}

// ===== Enums & Extensions =====

enum PaymentType { SELL, AUCTION, NEGO }

extension PaymentTypeX on PaymentType {
  static PaymentType fromBackend(dynamic v) {
    final s = v?.toString().toUpperCase();
    switch (s) {
      case 'AUCTION':
        return PaymentType.AUCTION;
      case 'NEGO':
        return PaymentType.NEGO;
      case 'SELL':
      default:
        return PaymentType.SELL;
    }
  }

  String get backend => switch (this) {
    PaymentType.SELL => 'SELL',
    PaymentType.AUCTION => 'AUCTION',
    PaymentType.NEGO => 'NEGO',
  };

  String get label => switch (this) {
    PaymentType.SELL => 'Jual Beli',
    PaymentType.AUCTION => 'Lelang',
    PaymentType.NEGO => 'Negosiasi',
  };
}

enum PaymentStatus { PENDING, SUKSES, BATAL, KADALUARSA }

extension PaymentStatusX on PaymentStatus {
  /// Robust terhadap salah ketik backend `KADAULARSA` vs `KADALUARSA`
  static PaymentStatus fromBackend(dynamic v) {
    final s = v?.toString().toUpperCase();
    switch (s) {
      case 'SUKSES':
        return PaymentStatus.SUKSES;
      case 'BATAL':
        return PaymentStatus.BATAL;
      case 'KADALUARSA':
      case 'KADAULARSA':
        return PaymentStatus.KADALUARSA;
      case 'PENDING':
      default:
        return PaymentStatus.PENDING;
    }
  }

  String get backend => switch (this) {
    PaymentStatus.PENDING => 'PENDING',
    PaymentStatus.SUKSES => 'SUKSES',
    PaymentStatus.BATAL => 'BATAL',
    PaymentStatus.KADALUARSA => 'KADALUARSA',
  };

  String get label => switch (this) {
    PaymentStatus.PENDING => 'Pending',
    PaymentStatus.SUKSES => 'Sukses',
    PaymentStatus.BATAL => 'Batal',
    PaymentStatus.KADALUARSA => 'Kedaluwarsa',
  };
}
