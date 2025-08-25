import 'dart:async';

import 'package:dabskoi/helper/colors.dart';
import 'package:dabskoi/screen/home/main_tab.dart';
import 'package:dabskoi/screen/payment/web_view_screen.dart';
import 'package:dabskoi/services/realtime_service.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:dabskoi/models/koi_responses.dart';
import 'package:dabskoi/services/koi_service.dart';
import 'package:carousel_slider/carousel_slider.dart';
import 'package:dabskoi/services/chat_service.dart';
import 'package:dabskoi/models/chat_requests.dart';
import 'package:dabskoi/helper/notify_snack_bar.dart';
import 'package:dabskoi/models/koi_requests.dart';

class KoiDetailScreen extends StatefulWidget {
  final String id;
  final KoiFetchType type;

  const KoiDetailScreen({super.key, required this.id, required this.type});

  @override
  State<KoiDetailScreen> createState() => _KoiDetailScreenState();
}

class _KoiDetailScreenState extends State<KoiDetailScreen> {
  final _primary = UIColors.mainRed;

  bool _loading = true;
  String _error = '';
  KoiResponse? _koi;

  bool _sendingRef = false;

  StreamSubscription? _auctionSub;

  // index tab chat
  static const int kChatTabIndex = 2;

  @override
  void initState() {
    super.initState();
    _fetch();
    RealtimeService.I.connect();
    if (widget.type == KoiFetchType.auctions) {
      _auctionSub = RealtimeService.I.auctionNotify$.listen((_) async {
        await _fetch();
      });
    }
  }

  @override
  void dispose() {
    _auctionSub?.cancel();
    super.dispose();
  }

  Future<void> _fetch() async {
    setState(() {
      _loading = true;
      _error = '';
    });

    try {
      final res = await KoiService().getKoiDetail(widget.type, widget.id);
      setState(() {
        _koi = res;
        _loading = false;
      });
    } catch (e) {
      setState(() {
        _error = 'Gagal memuat detail koi: $e';
        _loading = false;
      });
    }
  }

  String _toRefType(KoiFetchType t) {
    switch (t) {
      case KoiFetchType.sells:
        return 'SELL';
      case KoiFetchType.negos:
        return 'NEGO';
      case KoiFetchType.auctions:
        return 'AUCTION';
    }
  }

  Future<void> _sendReferenceToChat() async {
    if (_koi == null || _sendingRef) return;
    setState(() => _sendingRef = true);

    try {
      final ok = await ChatService().sendChatReference(
        SendChatReference(productId: _koi!.id, type: _toRefType(widget.type)),
      );

      if (!mounted) return;
      if (ok) {
        NotifySnackBar.showSuccess(context, 'Referensi terkirim ke chat');

        // Arahkan user ke MainTab dengan tab Chat terbuka
        Navigator.of(context).pushAndRemoveUntil(
          MaterialPageRoute(
            builder: (_) => MainTab(initialIndex: kChatTabIndex),
          ),
          (route) => false,
        );
      } else {
        NotifySnackBar.showError(
          context,
          Exception('Gagal mengirim referensi'),
        );
      }
    } catch (e) {
      if (!mounted) return;
      NotifySnackBar.showError(context, Exception('Gagal mengirim referensi'));
    } finally {
      if (mounted) setState(() => _sendingRef = false);
    }
  }

  Future<void> _openCertificate(String url) async {
    final uri = Uri.tryParse(url);
    if (uri == null) return;
    await launchUrl(uri, mode: LaunchMode.externalApplication);
  }

  @override
  Widget build(BuildContext context) {
    final title = switch (widget.type) {
      KoiFetchType.auctions => 'Detail Lelang',
      KoiFetchType.negos => 'Detail Negosiasi',
      KoiFetchType.sells => 'Detail Koi',
    };

    return Scaffold(
      appBar: AppBar(
        title: Text(title),
        backgroundColor: _primary,
        actions: [
          IconButton(icon: const Icon(Icons.refresh), onPressed: _fetch),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : (_error.isNotEmpty || _koi == null)
          ? _ErrorView(
              message: _error.isNotEmpty ? _error : 'Data tidak ditemukan',
              onRetry: _fetch,
            )
          : _DetailBody(
              koi: _koi!,
              type: widget.type,
              primary: _primary,
              openCertificate: _openCertificate,
              onSendReference: _sendReferenceToChat,
              sendingRef: _sendingRef,
              onRefresh: _fetch, // <= NEW
            ),
    );
  }
}

class _DetailBody extends StatelessWidget {
  final KoiResponse koi;
  final KoiFetchType type;
  final Color primary;
  final Future<void> Function(String url) openCertificate;
  final Future<void> Function() onRefresh;

  final VoidCallback onSendReference;
  final bool sendingRef;

  const _DetailBody({
    required this.koi,
    required this.type,
    required this.primary,
    required this.openCertificate,
    required this.onSendReference,
    required this.sendingRef,
    required this.onRefresh, // <= NEW
  });

  String _fmtPrice(num v) => 'Rp ${NumberFormat('#,###', 'id_ID').format(v)}';
  String _fmtDateNoSec(DateTime dt) =>
      DateFormat('yyyy-MM-dd HH:mm').format(dt.toLocal());

  int _parseToInt(String s) =>
      int.tryParse(s.replaceAll(RegExp(r'[^0-9]'), '')) ?? 0;

  Future<int?> _askPriceDialog(
    BuildContext context, {
    required String title,
    required String label,
    int? minPrice,
    int? initialPrice,
  }) async {
    final controller = TextEditingController(
      text: (initialPrice ?? minPrice ?? 0) > 0
          ? NumberFormat('#,###', 'id_ID').format(initialPrice ?? minPrice!)
          : '',
    );
    return showDialog<int?>(
      context: context,
      barrierDismissible: false,
      builder: (ctx) {
        String? errorText;
        return StatefulBuilder(
          builder: (ctx, setState) => AlertDialog(
            title: Text(title),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                if (minPrice != null && minPrice > 0)
                  Padding(
                    padding: const EdgeInsets.only(bottom: 8),
                    child: Text(
                      'Minimal: ${_fmtPrice(minPrice)}',
                      style: const TextStyle(fontSize: 12, color: Colors.grey),
                    ),
                  ),
                TextField(
                  controller: controller,
                  keyboardType: TextInputType.number,
                  decoration: InputDecoration(
                    labelText: label,
                    prefixText: 'Rp ',
                    errorText: errorText,
                  ),
                  onChanged: (v) {
                    // format ringan: biarin user ngetik bebas, kita parse saat submit
                    setState(() => errorText = null);
                  },
                ),
              ],
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(ctx, null),
                child: const Text('Batal'),
              ),
              ElevatedButton(
                onPressed: () {
                  final val = _parseToInt(controller.text);
                  if (val <= 0) {
                    setState(() => errorText = 'Masukkan nominal yang valid');
                    return;
                  }
                  if (minPrice != null && val < minPrice) {
                    setState(
                      () =>
                          errorText = 'Nominal harus ≥ ${_fmtPrice(minPrice)}',
                    );
                    return;
                  }
                  Navigator.pop(ctx, val);
                },
                child: const Text('Kirim'),
              ),
            ],
          ),
        );
      },
    );
  }

  Future<void> handleCta(BuildContext context) async {
    switch (type) {
      case KoiFetchType.auctions:
        // ===== AUCTION =====
        // Minimal tawaran: tertinggi saat ini jika ada, jika tidak pakai harga awal
        final current = (koi.highestBid != null && koi.highestBid! > 0)
            ? koi.highestBid!.toInt()
            : koi.price.toInt();

        final bidPrice = await _askPriceDialog(
          context,
          title: 'Pasang Tawaran',
          label: 'Nominal Tawaran',
          minPrice: current + 1, // harus >= current
          initialPrice: current,
        );
        if (bidPrice == null) return; // dibatalkan

        final res = await KoiService().setBid(
          KoiSetBidRequest(koiAuctionId: koi.id, price: bidPrice),
        );

        if (res["metaData"]?["code"] == 200) {
          NotifySnackBar.showSuccess(context, 'Tawaran berhasil dikirim');
          // refresh halaman detail
          Navigator.of(context).pushReplacement(
            MaterialPageRoute(
              builder: (_) => KoiDetailScreen(id: koi.id, type: type),
            ),
          );
        } else {
          NotifySnackBar.showError(
            context,
            Exception(res["metaData"]?["message"] ?? 'Gagal membuat tawaran'),
          );
        }
        break;

      case KoiFetchType.negos:
        // ===== NEGO =====
        final negoPrice = await _askPriceDialog(
          context,
          title: 'Mulai Negosiasi',
          label: 'Tawaran Anda',
          minPrice: 1,
          initialPrice: koi.price.toInt(), // start dari harga list
        );
        if (negoPrice == null) return;

        final res = await KoiService().makeNego(
          KoiMakeNegoRequest(productId: koi.id, price: negoPrice),
        );

        if (res["metaData"]?["code"] == 200) {
          NotifySnackBar.showSuccess(
            context,
            'Berhasil membuat negosiasi, tunggu konfirmasi penjual',
          );
          await Future.delayed(const Duration(milliseconds: 600));
          Navigator.of(context).pushAndRemoveUntil(
            MaterialPageRoute(builder: (_) => const MainTab(initialIndex: 2)),
            (route) => false,
          );
        } else {
          NotifySnackBar.showError(
            context,
            Exception(res["metaData"]?["message"] ?? 'Gagal membuat negosiasi'),
          );
        }
        break;

      case KoiFetchType.sells:
        // ===== SELL ===== (sudah OK punyamu, tidak diubah)
        showDialog(
          context: context,
          builder: (context) => AlertDialog(
            title: const Text('Konfirmasi'),
            content: const Text('Apakah Anda yakin ingin membeli koi ini?'),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(context),
                child: const Text('Tidak'),
              ),
              TextButton(
                onPressed: () async {
                  try {
                    final dynamic res = await KoiService().checkout(
                      KoiCheckoutRequest(koiSellId: koi.id),
                    );
                    if (res["data"]?["midtransDirectUrl"] != null) {
                      NotifySnackBar.showSuccess(
                        context,
                        'Berhasil membuat pembayaran, silakan selesaikan pembayaran',
                      );
                      await Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => WebViewScreen(
                            directUrl: res["data"]?["midtransDirectUrl"],
                          ),
                        ),
                      );
                      await onRefresh();
                      Navigator.pop(context);
                    }
                  } catch (e) {
                    NotifySnackBar.showError(context, e);
                  }
                },
                child: const Text('Ya'),
              ),
            ],
          ),
        );
        break;
    }
  }

  @override
  Widget build(BuildContext context) {
    final isAuction = type == KoiFetchType.auctions;

    String ctaText;
    bool ctaEnabled = true;

    switch (type) {
      case KoiFetchType.auctions:
        switch (koi.status) {
          case KoiStatus.BELUM_DIMULAI:
            ctaText = 'Belum Dimulai';
            break;
          case KoiStatus.AKTIF:
            ctaText = 'Pasang Tawaran';
            ctaEnabled = true;
            break;
          case KoiStatus.SELESAI:
            ctaText = 'Lelang Selesai';
            break;
          case KoiStatus.DIHAPUS:
            ctaText = 'Tidak Tersedia';
            break;
        }
        break;
      case KoiFetchType.negos:
        ctaText = 'Mulai Negosiasi';
        break;
      case KoiFetchType.sells:
        ctaText = 'Beli Sekarang';
        break;
    }

    if (koi.status != KoiStatus.AKTIF) {
      ctaEnabled = false;
    }

    Widget badge(String text, {Color? color, Color? textColor}) {
      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        decoration: BoxDecoration(
          color: color ?? Colors.black12,
          borderRadius: BorderRadius.circular(999),
        ),
        child: Text(
          text,
          style: TextStyle(fontSize: 11, color: textColor ?? Colors.black87),
        ),
      );
    }

    Color _statusBg(KoiStatus s) {
      switch (s) {
        case KoiStatus.AKTIF:
          return const Color(0xFFE6F4EA);
        case KoiStatus.SELESAI:
          return const Color(0xFFFFECE8);
        case KoiStatus.BELUM_DIMULAI:
          return const Color(0xFFE8F0FE);
        case KoiStatus.DIHAPUS:
          return const Color(0xFFF1F3F4);
      }
    }

    Color _statusFg(KoiStatus s) {
      switch (s) {
        case KoiStatus.AKTIF:
          return const Color(0xFF137333);
        case KoiStatus.SELESAI:
          return const Color(0xFFC5221F);
        case KoiStatus.BELUM_DIMULAI:
          return const Color(0xFF174EA6);
        case KoiStatus.DIHAPUS:
          return const Color(0xFF5F6368);
      }
    }

    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // ... (bagian gambar, meta, harga, certificate, deskripsi, bids)
          // (biarkan sama seperti versi sebelumnya yang sudah berfungsi)
          // Media / Carousel
          if (koi.images.isNotEmpty)
            ClipRRect(
              borderRadius: BorderRadius.circular(12),
              child: CarouselSlider(
                options: CarouselOptions(
                  height: 220,
                  viewportFraction: 1,
                  enableInfiniteScroll: koi.images.length > 1,
                ),
                items: koi.images.map((url) {
                  return Image.network(
                    url,
                    fit: BoxFit.cover,
                    width: double.infinity,
                    errorBuilder: (_, __, ___) => Container(
                      height: 220,
                      color: Colors.black12,
                      child: const Center(child: Icon(Icons.broken_image)),
                    ),
                  );
                }).toList(),
              ),
            )
          else
            Container(
              height: 220,
              width: double.infinity,
              decoration: BoxDecoration(
                color: Colors.black12,
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Center(child: Icon(Icons.image_not_supported)),
            ),

          const SizedBox(height: 12),

          // Judul & meta
          Text(
            koi.name,
            style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 6),
          Wrap(
            spacing: 8,
            runSpacing: 6,
            children: [
              badge(koi.type),
              badge(koi.gender.label),
              badge('${koi.length} cm'),
              badge('${koi.weight} g'),
              badge(
                koi.status.label,
                color: _statusBg(koi.status),
                textColor: _statusFg(koi.status),
              ),
            ],
          ),

          const SizedBox(height: 16),

          // Harga / info auction
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.black12),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (!isAuction) ...[
                  Text(
                    'Harga',
                    style: TextStyle(color: Colors.grey[700], fontSize: 12),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    _fmtPrice(koi.price),
                    style: TextStyle(
                      color: primary,
                      fontWeight: FontWeight.bold,
                      fontSize: 18,
                    ),
                  ),
                ] else ...[
                  Text(
                    'Harga Awal',
                    style: TextStyle(color: Colors.grey[700], fontSize: 12),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    _fmtPrice(koi.price),
                    style: TextStyle(
                      color: primary,
                      fontWeight: FontWeight.w700,
                      fontSize: 16,
                    ),
                  ),
                  const SizedBox(height: 10),
                  if (koi.highestBid != null && (koi.highestBid ?? 0) > 0) ...[
                    Text(
                      'Tawaran Tertinggi',
                      style: TextStyle(color: Colors.grey[700], fontSize: 12),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      _fmtPrice(koi.highestBid!),
                      style: const TextStyle(
                        color: Colors.green,
                        fontWeight: FontWeight.w700,
                        fontSize: 18,
                      ),
                    ),
                    const SizedBox(height: 10),
                  ],
                  if (koi.startAt != null) ...[
                    Row(
                      children: [
                        const Icon(Icons.play_circle_outline, size: 18),
                        const SizedBox(width: 6),
                        Text('Mulai: ${_fmtDateNoSec(koi.startAt!)}'),
                      ],
                    ),
                    const SizedBox(height: 6),
                  ],
                  if (koi.endAt != null)
                    Row(
                      children: [
                        const Icon(Icons.stop_circle_outlined, size: 18),
                        const SizedBox(width: 6),
                        Text('Selesai: ${_fmtDateNoSec(koi.endAt!)}'),
                      ],
                    ),
                ],
              ],
            ),
          ),

          const SizedBox(height: 16),

          // Sertifikat (opsional)
          if (koi.certificate != null && koi.certificate!.isNotEmpty)
            InkWell(
              onTap: () => openCertificate(koi.certificate!),
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: const Color(0xFFF7F7F7),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.black12),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.verified, color: Colors.blueGrey),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'Lihat Sertifikat',
                        style: TextStyle(
                          color: Colors.blue[700],
                          decoration: TextDecoration.underline,
                        ),
                      ),
                    ),
                    const Icon(Icons.open_in_new, size: 18),
                  ],
                ),
              ),
            ),

          const SizedBox(height: 16),

          // Deskripsi
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.black12),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Deskripsi',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                ),
                const SizedBox(height: 8),
                Text(
                  koi.description.isEmpty
                      ? 'Tidak ada deskripsi.'
                      : koi.description,
                  style: TextStyle(color: Colors.grey[800]),
                ),
              ],
            ),
          ),

          // Daftar Bids (khusus auction, jika ada)
          if (isAuction && koi.bids.isNotEmpty) ...[
            const SizedBox(height: 16),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.black12),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Riwayat Tawaran',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                  ),
                  const SizedBox(height: 8),
                  ListView.separated(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: koi.bids.length,
                    separatorBuilder: (_, __) => const Divider(height: 14),
                    itemBuilder: (_, i) {
                      final b = koi.bids[i];
                      final user = b.user;
                      return Row(
                        children: [
                          CircleAvatar(
                            radius: 16,
                            backgroundColor: Colors.black12,
                            backgroundImage:
                                (user?.picture != null &&
                                    user!.picture!.isNotEmpty)
                                ? NetworkImage(user.picture!)
                                : null,
                            child:
                                (user?.picture == null ||
                                    user!.picture!.isEmpty)
                                ? Text(
                                    (user?.name.isNotEmpty == true
                                            ? user!.name[0]
                                            : '?')
                                        .toUpperCase(),
                                    style: const TextStyle(
                                      color: Colors.black54,
                                    ),
                                  )
                                : null,
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  user?.name ?? 'Pengguna',
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: const TextStyle(
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  DateFormat(
                                    'yyyy-MM-dd HH:mm',
                                  ).format(b.createdAt.toLocal()),
                                  style: const TextStyle(
                                    fontSize: 12,
                                    color: Colors.black54,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          Text(
                            _fmtPrice(b.price),
                            style: const TextStyle(
                              fontWeight: FontWeight.w700,
                              color: Colors.green,
                            ),
                          ),
                        ],
                      );
                    },
                  ),
                ],
              ),
            ),
          ],

          const SizedBox(height: 24),

          // NEW: CTA kirim referensi ke chat
          SizedBox(
            width: double.infinity,
            child: OutlinedButton.icon(
              icon: sendingRef
                  ? const SizedBox(
                      width: 16,
                      height: 16,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Icon(Icons.chat_outlined),
              label: Text(
                sendingRef ? 'Mengirim…' : 'Tanya Di Chat',
                style: const TextStyle(fontWeight: FontWeight.w600),
              ),
              onPressed: sendingRef ? null : onSendReference,
              style: OutlinedButton.styleFrom(
                side: BorderSide(color: primary),
                foregroundColor: primary,
                padding: const EdgeInsets.symmetric(vertical: 12),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10),
                ),
              ),
            ),
          ),

          const SizedBox(height: 10),

          // CTA utama (aksi sesuai jenis)
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: ctaEnabled
                  ? () {
                      handleCta(context);
                    }
                  : null,
              style: ElevatedButton.styleFrom(
                backgroundColor: ctaEnabled ? primary : Colors.grey,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10),
                ),
              ),
              child: Text(
                ctaText,
                style: const TextStyle(
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
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
