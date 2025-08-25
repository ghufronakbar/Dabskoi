import 'package:dabskoi/models/account_responses.dart';
import 'package:dio/dio.dart';
import '../core/dio_client.dart';
import '../models/account_requests.dart';
import '../core/token_storage.dart';
import '../core/account_storage.dart';

class AccountService {
  final Dio _dio;
  AccountService({Dio? dio}) : _dio = dio ?? DioClient.I;

  Future<dynamic> login(PostLoginRequest body) async {
    final res = await _dio.post('/user/account/login', data: body.toJson());
    final data = res.data;
    final token = data["data"]["accessToken"];
    if (token != null && token.isNotEmpty) {
      await TokenStorage.save(token);
      await AccountStorage.save(Account.fromJson(data["data"]));
    }
    return Account.fromJson(data["data"]);
  }

  Future<dynamic> signup(PostRegisterRequest body) async {
    final res = await _dio.post('/user/account/register', data: body.toJson());
    final data = res.data;
    final token = data["data"]["accessToken"];
    if (token != null && token.isNotEmpty) {
      await TokenStorage.save(token);
      await AccountStorage.save(Account.fromJson(data["data"]));
    }
    return Account.fromJson(data["data"]);
  }

  Future<Account> getProfile() async {
    final accountFromStorage = await AccountStorage.read();
    if (accountFromStorage != null) {
      return accountFromStorage;
    }
    final res = await _dio.get('/user/account/profile');
    final account = Account.fromJson(res.data);
    await AccountStorage.save(account);
    return account;
  }

  Future<Account> updateProfile(UpdateProfileRequest body) async {
    final res = await _dio.put('/user/account/update', data: body.toJson());
    final account = Account.fromJson(res.data["data"]);
    await AccountStorage.save(account);
    return account;
  }
}
