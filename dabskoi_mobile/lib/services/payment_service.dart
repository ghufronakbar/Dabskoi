import 'package:dabskoi/models/payment_responses.dart';
import 'package:dio/dio.dart';
import 'package:dabskoi/core/dio_client.dart';

class PaymentService {
  final Dio _dio;
  PaymentService({Dio? dio}) : _dio = dio ?? DioClient.I;

  Future<List<PaymentResponse>> getAllPaymentHistory() async {
    final res = await _dio.get('/user/payment');
    final data = res.data["data"];
    return _mapList(data);
  }

  Future<PaymentResponse> getPaymentHistoryById(String id) async {
    final res = await _dio.get('/user/payment/$id');
    final data = res.data["data"];
    return PaymentResponse.fromJson(data);
  }

  List<PaymentResponse> _mapList(dynamic data) {
    if (data is List) {
      return data
          .whereType<Map<String, dynamic>>()
          .map((e) => PaymentResponse.fromJson(e))
          .toList();
    }

    return <PaymentResponse>[];
  }

  Future<dynamic> cancelPayment(String id) async {
    final res = await _dio.post('/user/payment/cancel/$id');
    return res.data;
  }
}
