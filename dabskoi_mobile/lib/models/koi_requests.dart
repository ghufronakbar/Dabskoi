class KoiCheckoutRequest {
  final String koiSellId;

  KoiCheckoutRequest({required this.koiSellId});

  Map<String, dynamic> toJson() => {'koiSellId': koiSellId};
}

class KoiSetBidRequest {
  final String koiAuctionId;
  final num price;

  KoiSetBidRequest({required this.koiAuctionId, required this.price});

  Map<String, dynamic> toJson() => {
    'koiAuctionId': koiAuctionId,
    'price': price,
  };
}

class KoiMakeNegoRequest {
  final String productId;
  final num price;

  KoiMakeNegoRequest({required this.productId, required this.price});

  Map<String, dynamic> toJson() => {'productId': productId, 'price': price};
}
