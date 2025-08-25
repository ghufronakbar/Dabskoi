import 'package:dio/dio.dart';
import 'constants.dart';
import 'token_storage.dart';

class DioClient {
  static late final Dio _dio;
  static bool _initialized = false;

  static void init() {
    if (_initialized) return;
    _dio = Dio(
      BaseOptions(
        baseUrl: '$apiBaseUrl/api',
        connectTimeout: const Duration(seconds: 20),
        receiveTimeout: const Duration(seconds: 20),
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      ),
    );

    // Interceptor: attach token
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await TokenStorage.read();
          if (token != null && token.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          return handler.next(options);
        },
        onResponse: (response, handler) {
          return handler.next(response);
        },
        onError: (DioException e, handler) async {
          return handler.next(e);
        },
      ),
    );

    // (Opsional) logging
    _dio.interceptors.add(
      LogInterceptor(
        requestBody: true,
        responseBody: false,
        requestHeader: false,
        responseHeader: false,
      ),
    );

    _initialized = true;
  }

  static Dio get I {
    if (!_initialized) init();
    return _dio;
  }
}
