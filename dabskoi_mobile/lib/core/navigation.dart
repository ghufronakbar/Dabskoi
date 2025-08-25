import 'package:dabskoi/core/account_storage.dart';
import 'package:dabskoi/core/token_storage.dart';
import 'package:flutter/material.dart';

final GlobalKey<NavigatorState> rootNavigatorKey = GlobalKey<NavigatorState>();

void goToLoginAndClearStack(BuildContext context) {
  AccountStorage.clear();
  TokenStorage.clear();
  rootNavigatorKey.currentState?.pushNamedAndRemoveUntil(
    '/login',
    (r) => false,
  );
}
