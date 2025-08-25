import 'package:dio/dio.dart';
import 'package:dabskoi/core/dio_client.dart';
import 'package:dabskoi/models/chat_requests.dart';
import 'package:dabskoi/models/chat_responses.dart';

class ChatService {
  final Dio _dio;
  ChatService({Dio? dio}) : _dio = dio ?? DioClient.I;

  Future<ChatResponse> getChat() async {
    final res = await _dio.get('/user/chat');
    final data = res.data['data'];
    final map = (data is Map<String, dynamic>) ? data : <String, dynamic>{};
    return ChatResponse.fromJson(map);
  }

  Future<bool> sendChat(SendChatRequest request) async {
    final res = await _dio.post('/user/chat', data: request.toJson());
    return res.statusCode == 200;
  }

  Future<bool> sendChatReference(SendChatReference request) async {
    final res = await _dio.post('/user/chat/refer', data: request.toJson());
    return res.statusCode == 200;
  }
}
