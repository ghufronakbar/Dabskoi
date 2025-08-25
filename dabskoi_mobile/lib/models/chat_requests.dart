class SendChatRequest {
  final String content;
  final String type;

  SendChatRequest({required this.content, required this.type});

  Map<String, dynamic> toJson() => {'content': content, 'type': type};
}

class SendChatReference {
  final String productId;
  final String type; // "NEGO" | "AUCTION" | "SELL"

  SendChatReference({required this.productId, required this.type});

  Map<String, dynamic> toJson() => {'productId': productId, 'type': type};
}
