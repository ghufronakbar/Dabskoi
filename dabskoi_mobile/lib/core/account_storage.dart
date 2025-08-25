import 'package:dabskoi/models/account_responses.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';

class AccountStorage {
  static const _kAccountKey = 'account';

  static Future<void> save(Account account) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_kAccountKey, jsonEncode(account.toJson()));
  }

  static Future<Account?> read() async {
    final prefs = await SharedPreferences.getInstance();
    final jsonString = prefs.getString(_kAccountKey);
    if (jsonString == null) {
      return null;
    }
    return Account.fromJson(jsonDecode(jsonString));
  }

  static Future<void> clear() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_kAccountKey);
  }
}
