import 'package:dio/dio.dart';
import 'package:dabskoi/core/dio_client.dart';
import 'package:dabskoi/models/koi_requests.dart';
import 'package:dabskoi/models/koi_responses.dart';

class KoiService {
  final Dio _dio;
  KoiService({Dio? dio}) : _dio = dio ?? DioClient.I;

  Future<List<KoiResponse>> getKoiSellList() async {
    final res = await _dio.get('/user/koi/sells');
    final data = res.data["data"];
    return _mapList(data);
  }

  Future<List<KoiResponse>> getKoiNegoList() async {
    final res = await _dio.get('/user/koi/negos');
    final data = res.data["data"];
    return _mapList(data);
  }

  Future<List<KoiResponse>> getKoiAuctionList() async {
    final res = await _dio.get('/user/koi/auctions');
    final data = res.data["data"];
    return _mapList(data);
  }

  Future<KoiResponse> getKoiDetail(KoiFetchType type, String id) async {
    final res = await _dio.get('/user/koi/${type.name}/$id');
    final data = res.data["data"];
    return KoiResponse.fromJson(data);
  }

  List<KoiResponse> _mapList(dynamic data) {
    if (data is List) {
      return data
          .whereType<Map<String, dynamic>>()
          .map((e) => KoiResponse.fromJson(e))
          .toList();
    }

    return <KoiResponse>[];
  }

  Future<dynamic> checkout(KoiCheckoutRequest request) async {
    final res = await _dio.post(
      '/user/payment/checkout',
      data: request.toJson(),
    );
    return res.data;
  }

  Future<dynamic> setBid(KoiSetBidRequest request) async {
    final res = await _dio.post(
      '/user/koi/auctions/bid',
      data: request.toJson(),
    );
    return res.data;
  }

  Future<dynamic> makeNego(KoiMakeNegoRequest request) async {
    final res = await _dio.post('/user/chat/nego', data: request.toJson());
    return res.data;
  }
}

enum KoiFetchType { sells, negos, auctions }
