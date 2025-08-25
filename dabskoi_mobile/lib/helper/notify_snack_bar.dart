// error handler

import 'package:dio/dio.dart';
import 'package:flutter/material.dart';

class NotifySnackBar {
  static GlobalKey<ScaffoldMessengerState>? _globalKey;

  static void attachGlobalKey(GlobalKey<ScaffoldMessengerState> key) {
    _globalKey = key;
  }

  static void _show(
    BuildContext? ctx,
    String message, {
    Color? bg,
    Duration? duration,
  }) {
    final snack = SnackBar(
      content: Text(message),
      backgroundColor: bg,
      behavior: SnackBarBehavior.floating,
      duration: duration ?? const Duration(seconds: 3),
    );
    if (ctx != null) {
      ScaffoldMessenger.of(ctx).clearSnackBars();
      ScaffoldMessenger.of(ctx).showSnackBar(snack);
    } else {
      final ms = _globalKey?.currentState;
      if (ms == null) return;
      ms.clearSnackBars();
      ms.showSnackBar(snack);
    }
  }

  static void showError(BuildContext context, Object error) {
    if (error is DioException) {
      final errorMessage =
          error.response?.data['responseMessage'] ?? 'Terjadi kesalahan';
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(errorMessage), backgroundColor: Colors.red),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(error.toString()), backgroundColor: Colors.red),
      );
    }
  }

  static void showSuccess(BuildContext context, String? message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message ?? 'Berhasil'),
        backgroundColor: Colors.green,
      ),
    );
  }

  static void showGlobal(String msg, {Color? bg, Duration? duration}) =>
      _show(null, msg, bg: bg, duration: duration);
}
