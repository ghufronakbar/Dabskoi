// lib/screen/payment/detail_payment_screen.dart
import 'dart:async';
import 'package:dabskoi/helper/colors.dart';
import 'package:dabskoi/helper/sizes.dart';
import 'package:dabskoi/models/payment_responses.dart';
import 'package:dabskoi/screen/payment/web_view_screen.dart';
import 'package:dabskoi/services/payment_service.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

class DetailPaymentScreen extends StatefulWidget {
  final String id;
  const DetailPaymentScreen({super.key, required this.id});

  @override
  State<DetailPaymentScreen> createState() => _DetailPaymentScreenState();
}

class _DetailPaymentScreenState extends State<DetailPaymentScreen> {
  final _svc = PaymentService();
  final _currency = NumberFormat('#,###', 'id_ID');

  bool _loading = true;
  bool _canceling = false;
  String _error = '';
  PaymentResponse? _data;

  // Countdown
  Timer? _ticker;
  Duration _remaining = Duration.zero;

  @override
  void initState() {
    super.initState();
    _fetch();
  }

  @override
  void dispose() {
    _ticker?.cancel();
    super.dispose();
  }

  Future<void> _fetch() async {
    setState(() {
      _loading = true;
      _error = '';
    });
    try {
      final res = await _svc.getPaymentHistoryById(widget.id);
      _setupCountdown(res);
      setState(() {
        _data = res;
        _loading = false;
      });
    } catch (e) {
      _ticker?.cancel();
      setState(() {
        _error = 'Gagal memuat detail pembayaran: $e';
        _loading = false;
      });
    }
  }

  void _setupCountdown(PaymentResponse p) {
    _ticker?.cancel();
    if (p.status == PaymentStatus.PENDING && p.expiredAt != null) {
      _remaining = p.expiredAt!.difference(DateTime.now());
      if (_remaining.isNegative) _remaining = Duration.zero;

      _ticker = Timer.periodic(const Duration(seconds: 1), (t) async {
        if (!mounted) return;
        setState(() {
          _remaining = _remaining - const Duration(seconds: 1);
          if (_remaining.isNegative) _remaining = Duration.zero;
        });
        if (_remaining.inSeconds == 0) {
          t.cancel();
          // otomatis re-fetch ketika waktu habis
          await _fetch();
        }
      });
    } else {
      _remaining = Duration.zero;
    }
  }

  String _fmtMoney(num v) => 'Rp ${_currency.format(v)}';
  String _fmtTime(DateTime d) =>
      DateFormat('yyyy-MM-dd HH:mm').format(d.toLocal());

  String _fmtCountdown(Duration d) {
    final two = (int n) => n.toString().padLeft(2, '0');
    final h = two(d.inHours);
    final m = two(d.inMinutes.remainder(60));
    final s = two(d.inSeconds.remainder(60));
    return '$h:$m:$s';
  }

  Future<void> _gotoPay() async {
    final p = _data;
    if (p == null) return;
    if (p.status != PaymentStatus.PENDING) return;

    final url = p.midtransDirectUrl?.trim() ?? '';
    if (url.isEmpty) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Link pembayaran tidak tersedia')),
      );
      return;
    }

    await Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => WebViewScreen(directUrl: url)),
    );
    if (!mounted) return;
    await _fetch(); // selalu re-fetch setelah kembali dari webview
  }

  Future<void> _cancelPayment() async {
    final p = _data;
    if (p == null || p.status != PaymentStatus.PENDING) return;

    final confirm = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Batalkan Pembayaran'),
        content: const Text('Anda yakin ingin membatalkan pembayaran ini?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Tidak'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Ya'),
          ),
        ],
      ),
    );

    if (confirm != true) return;

    setState(() => _canceling = true);
    try {
      await _svc.cancelPayment(p.id);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Permintaan pembatalan dikirim')),
      );
      await _fetch();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('Gagal membatalkan: $e')));
    } finally {
      if (mounted) setState(() => _canceling = false);
    }
  }

  Color _statusBg(PaymentStatus s) {
    switch (s) {
      case PaymentStatus.SUKSES:
        return const Color(0xFFE6F4EA);
      case PaymentStatus.PENDING:
        return const Color(0xFFFFF4E5);
      case PaymentStatus.BATAL:
        return const Color(0xFFFFEBEE);
      case PaymentStatus.KADALUARSA:
        return const Color(0xFFF1F3F4);
    }
  }

  Color _statusFg(PaymentStatus s) {
    switch (s) {
      case PaymentStatus.SUKSES:
        return const Color(0xFF137333);
      case PaymentStatus.PENDING:
        return const Color(0xFFB06F00);
      case PaymentStatus.BATAL:
        return const Color(0xFFC5221F);
      case PaymentStatus.KADALUARSA:
        return const Color(0xFF5F6368);
    }
  }

  Widget _statusChip(PaymentStatus s) => Container(
    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
    decoration: BoxDecoration(
      color: _statusBg(s),
      borderRadius: BorderRadius.circular(999),
    ),
    child: Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(
          s == PaymentStatus.SUKSES
              ? Icons.check_circle
              : s == PaymentStatus.PENDING
              ? Icons.pending
              : s == PaymentStatus.BATAL
              ? Icons.cancel
              : Icons.hourglass_disabled,
          size: 14,
          color: _statusFg(s),
        ),
        const SizedBox(width: 6),
        Text(s.label, style: TextStyle(fontSize: 11, color: _statusFg(s))),
      ],
    ),
  );

  @override
  Widget build(BuildContext context) {
    final primary = UIColors.mainRed;

    return Scaffold(
      backgroundColor: UIColors.tabMainBacground,
      appBar: AppBar(
        title: const Text(
          'Detail Pembayaran',
          style: TextStyle(fontWeight: FontWeight.bold, fontSize: UISizes.md),
          overflow: TextOverflow.ellipsis,
        ),
        backgroundColor: UIColors.mainWhite,
        elevation: 0.5,
        actions: [
          IconButton(
            tooltip: 'Check Status',
            icon: const Icon(Icons.refresh),
            onPressed: _fetch,
          ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : (_error.isNotEmpty || _data == null)
          ? _ErrorView(
              message: _error.isNotEmpty ? _error : 'Data tidak ditemukan',
              onRetry: _fetch,
            )
          : _DetailBody(
              data: _data!,
              fmtMoney: _fmtMoney,
              fmtTime: _fmtTime,
              statusChip: _statusChip,
              // extras buat UI cakep
              primary: primary,
              countdown:
                  (_data!.status == PaymentStatus.PENDING &&
                      _data!.expiredAt != null)
                  ? _fmtCountdown(_remaining)
                  : null,
            ),
      bottomNavigationBar: _loading || _data == null
          ? null
          : SafeArea(
              minimum: const EdgeInsets.fromLTRB(16, 8, 16, 16),
              child: Row(
                children: [
                  if (_data!.status == PaymentStatus.PENDING)
                    Expanded(
                      child: OutlinedButton.icon(
                        icon: _canceling
                            ? const SizedBox(
                                width: 16,
                                height: 16,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                ),
                              )
                            : const Icon(Icons.cancel_outlined),
                        onPressed:
                            (_data!.status == PaymentStatus.PENDING &&
                                !_canceling)
                            ? _cancelPayment
                            : null,
                        style: OutlinedButton.styleFrom(
                          foregroundColor:
                              (_data!.status == PaymentStatus.PENDING)
                              ? primary
                              : Colors.grey,
                          side: BorderSide(
                            color: (_data!.status == PaymentStatus.PENDING)
                                ? primary
                                : Colors.grey,
                          ),
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(10),
                          ),
                        ),
                        label: const Text('Batalkan'),
                      ),
                    ),
                  if (_data!.status == PaymentStatus.PENDING)
                    const SizedBox(width: 12),
                  if (_data!.status == PaymentStatus.PENDING)
                    Expanded(
                      child: ElevatedButton.icon(
                        icon: const Icon(Icons.open_in_new),
                        onPressed: _gotoPay,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: primary,
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(10),
                          ),
                          elevation: 2,
                        ),
                        label: const Text(
                          'Lanjut Bayar',
                          style: TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ),
                ],
              ),
            ),
    );
  }
}

class _DetailBody extends StatelessWidget {
  final PaymentResponse data;
  final String Function(num) fmtMoney;
  final String Function(DateTime) fmtTime;
  final Widget Function(PaymentStatus) statusChip;

  // extra
  final Color primary;
  final String? countdown; // "HH:MM:SS" ketika pending

  const _DetailBody({
    required this.data,
    required this.fmtMoney,
    required this.fmtTime,
    required this.statusChip,
    required this.primary,
    required this.countdown,
  });

  @override
  Widget build(BuildContext context) {
    final img = (data.product.images.isNotEmpty)
        ? data.product.images.first
        : null;

    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Banner cantik (jika pending): Bayar sebelum + counter
          if (data.status == PaymentStatus.PENDING && data.expiredAt != null)
            _countdownBanner(context),

          const SizedBox(height: 12),

          // Kartu produk
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [Colors.white, Colors.white, Colors.grey.shade50],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.black12),
              boxShadow: const [
                BoxShadow(
                  color: Color.fromRGBO(0, 0, 0, 0.05),
                  blurRadius: 8,
                  offset: Offset(0, 3),
                ),
              ],
            ),
            child: Row(
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(10),
                  child: (img != null && img.isNotEmpty)
                      ? Image.network(
                          img,
                          width: 80,
                          height: 80,
                          fit: BoxFit.cover,
                          errorBuilder: (_, __, ___) => _imgPlaceholder(),
                        )
                      : _imgPlaceholder(),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        data.product.name.isEmpty
                            ? '(Tanpa Nama)'
                            : data.product.name,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          fontWeight: FontWeight.w800,
                          fontSize: 16,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Wrap(
                        spacing: 8,
                        runSpacing: 6,
                        crossAxisAlignment: WrapCrossAlignment.center,
                        children: [
                          statusChip(data.status),
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 8,
                              vertical: 4,
                            ),
                            decoration: BoxDecoration(
                              color: Colors.black12,
                              borderRadius: BorderRadius.circular(999),
                            ),
                            child: Text(
                              data.product.type.label,
                              style: const TextStyle(fontSize: 11),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 16),

          // Jumlah & meta
          _card(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Jumlah',
                  style: TextStyle(color: Colors.grey[700], fontSize: 12),
                ),
                const SizedBox(height: 6),
                Text(
                  fmtMoney(data.amount),
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 20,
                  ),
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(child: _kv('ID Pembayaran', data.id)),
                  ],
                ),
              ],
            ),
          ),

          const SizedBox(height: 16),

          // Waktu
          _card(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _kv('Dibuat', fmtTime(data.createdAt)),
                const SizedBox(height: 6),
                _kv('Diperbarui', fmtTime(data.updatedAt)),
                if (data.expiredAt != null) ...[
                  const SizedBox(height: 6),
                  _kv('Kadaluarsa', fmtTime(data.expiredAt!)),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _countdownBanner(BuildContext context) {
    final remain = countdown ?? '00:00:00';
    final dueAt = DateFormat(
      'dd MMM yyyy HH:mm',
    ).format(data.expiredAt!.toLocal());

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [primary, primary.withOpacity(0.85)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(12),
        boxShadow: const [
          BoxShadow(
            color: Color.fromRGBO(0, 0, 0, 0.15),
            blurRadius: 8,
            offset: Offset(0, 3),
          ),
        ],
      ),
      child: Row(
        children: [
          const Icon(Icons.schedule, color: Colors.white),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Bayar sebelum',
                  style: TextStyle(color: Colors.white70, fontSize: 12),
                ),
                const SizedBox(height: 2),
                Text(
                  dueAt,
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w700,
                    fontSize: 14,
                  ),
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Text(
              remain,
              style: TextStyle(
                color: primary,
                fontFeatures: const [FontFeature.tabularFigures()],
                fontWeight: FontWeight.w900,
                letterSpacing: 1.2,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _kv(String k, String v) => Row(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      SizedBox(
        width: 120,
        child: Text(k, style: const TextStyle(color: Colors.black54)),
      ),
      const SizedBox(width: 8),
      Expanded(child: Text(v)),
    ],
  );

  Widget _card({required Widget child}) => Container(
    width: double.infinity,
    padding: const EdgeInsets.all(14),
    decoration: BoxDecoration(
      color: Colors.white,
      borderRadius: BorderRadius.circular(12),
      border: Border.all(color: Colors.black12),
      boxShadow: const [
        BoxShadow(
          color: Color.fromRGBO(0, 0, 0, 0.05),
          blurRadius: 8,
          offset: Offset(0, 3),
        ),
      ],
    ),
    child: child,
  );

  Widget _imgPlaceholder() => Container(
    width: 80,
    height: 80,
    color: Colors.black12,
    child: const Icon(Icons.broken_image, color: Colors.black45),
  );
}

class _ErrorView extends StatelessWidget {
  final String message;
  final VoidCallback onRetry;
  const _ErrorView({required this.message, required this.onRetry});

  @override
  Widget build(BuildContext context) {
    final m = message.isEmpty ? 'Terjadi kesalahan' : message;
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.error_outline, size: 48, color: Colors.red),
            const SizedBox(height: 8),
            Text(m, textAlign: TextAlign.center),
            const SizedBox(height: 12),
            ElevatedButton.icon(
              onPressed: onRetry,
              icon: const Icon(Icons.refresh),
              label: const Text('Coba lagi'),
            ),
          ],
        ),
      ),
    );
  }
}
