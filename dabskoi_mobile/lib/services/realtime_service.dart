import 'dart:async';
import 'package:dabskoi/core/constants.dart';
import 'package:dabskoi/helper/colors.dart';
import 'package:flutter/material.dart';
// ignore: library_prefixes
import 'package:socket_io_client/socket_io_client.dart' as IO;
import 'package:dabskoi/helper/notify_snack_bar.dart';
import 'package:dabskoi/services/account_service.dart';

class RealtimeService {
  RealtimeService._();
  static final RealtimeService I = RealtimeService._();

  IO.Socket? _socket;
  bool get isConnected => _socket?.connected == true;

  // broadcast stream untuk halaman yang ingin subscribe
  final _chatNewCtrl = StreamController<Map<String, dynamic>>.broadcast();
  final _auctionNotifyCtrl = StreamController<Map<String, dynamic>>.broadcast();

  Stream<Map<String, dynamic>> get chatNew$ => _chatNewCtrl.stream;
  Stream<Map<String, dynamic>> get auctionNotify$ => _auctionNotifyCtrl.stream;

  Future<void> connect() async {
    if (_socket != null && _socket!.connected) return;

    // Ambil token user (dari AccountService kamu)
    final account = await AccountService().getProfile();
    final token = account.accessToken;

    // Buat socket baru
    _socket = IO.io(
      apiBaseUrl,
      IO.OptionBuilder()
          .setTransports(['websocket'])
          .disableAutoConnect()
          .setAuth({'token': token}) // <— auth seperti TS
          .setReconnectionAttempts(999999)
          .setReconnectionDelay(1000)
          .build(),
    );

    // Lifecycle
    _socket!.onConnect((_) {
      NotifySnackBar.showGlobal('Terhubung ke server', bg: Colors.green);
    });

    _socket!.onDisconnect((_) {
      NotifySnackBar.showGlobal('Terputus dari server', bg: UIColors.mainRed);
    });

    // ===== Event handlers =====
    _socket!.on('chat:new', (data) {
      // bentuk payload: { message: {...} }
      try {
        final message = (data is Map) ? data['message'] : null;
        String formatted = '';
        if (message is Map) {
          final type = message['type']?.toString() ?? 'TEXT';
          final chat = message['chat'] as Map?;
          final content = chat?['content']?.toString() ?? '';
          if (type == 'IMAGE') {
            formatted = 'Admin mengirim gambar';
          } else {
            formatted = "Admin mengirim pesan baru: $content";
          }
        } else {
          formatted = 'Pesan baru diterima';
        }

        // Global snackbar
        if (formatted.isNotEmpty) {
          NotifySnackBar.showGlobal(formatted);
        }
      } catch (_) {
        // swallow errors
      }

      // broadcast ke subscriber (contoh: ChatScreen untuk refetch)
      if (data is Map<String, dynamic>) {
        _chatNewCtrl.add(data);
      } else {
        _chatNewCtrl.add({'raw': data});
      }
    });

    _socket!.on('auction:notify', (data) {
      try {
        // payload dipakai langsung message-nya
        String msg;
        if (data is Map && data['message'] != null) {
          msg = data['message'].toString();
        } else {
          msg = 'Notifikasi lelang';
        }
        NotifySnackBar.showGlobal(msg);
      } catch (_) {}
      if (data is Map<String, dynamic>) {
        _auctionNotifyCtrl.add(data);
      } else {
        _auctionNotifyCtrl.add({'raw': data});
      }
    });

    _socket!.connect();
  }

  void disconnect() {
    _socket?.dispose();
    _socket = null;
  }

  void dispose() {
    disconnect();
    _chatNewCtrl.close();
    _auctionNotifyCtrl.close();
  }
}
