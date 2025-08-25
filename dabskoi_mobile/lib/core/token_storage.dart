import 'package:shared_preferences/shared_preferences.dart';

class TokenStorage {
  static const _kAccessToken = 'accessToken';

  static Future<void> save(String token) async {
    final sp = await SharedPreferences.getInstance();
    await sp.setString(_kAccessToken, token);
  }

  static Future<String?> read() async {
    final sp = await SharedPreferences.getInstance();
    return sp.getString(_kAccessToken);
  }

  static Future<void> clear() async {
    final sp = await SharedPreferences.getInstance();
    await sp.remove(_kAccessToken);
  }
}
