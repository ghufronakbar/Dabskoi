import 'package:dabskoi/helper/colors.dart';
import 'package:dabskoi/helper/sizes.dart';
import 'package:dabskoi/models/payment_responses.dart';
import 'package:dabskoi/services/payment_service.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:dabskoi/screen/home/tab/payment/payment_detail_screen.dart';

class PaymentScreen extends StatefulWidget {
  const PaymentScreen({super.key});

  @override
  State<PaymentScreen> createState() => _PaymentScreenState();
}

class _PaymentScreenState extends State<PaymentScreen> {
  final _svc = PaymentService();
  final _currency = NumberFormat('#,###', 'id_ID');

  bool _loading = true;
  String _error = '';
  List<PaymentResponse> _items = [];

  @override
  void initState() {
    super.initState();
    _fetch();
  }

  Future<void> _fetch() async {
    setState(() {
      _loading = true;
      _error = '';
    });
    try {
      final data = await _svc.getAllPaymentHistory();
      data.sort((a, b) => b.createdAt.compareTo(a.createdAt));
      setState(() {
        _items = data;
        _loading = false;
      });
    } catch (e) {
      setState(() {
        _error = 'Gagal memuat riwayat pembayaran: $e';
        _loading = false;
      });
    }
  }

  String _fmtMoney(num v) => 'Rp ${_currency.format(v)}';
  String _fmtTime(DateTime d) =>
      DateFormat('yyyy-MM-dd HH:mm').format(d.toLocal());

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
    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
    decoration: BoxDecoration(
      color: _statusBg(s),
      borderRadius: BorderRadius.circular(999),
    ),
    child: Text(s.label, style: TextStyle(fontSize: 11, color: _statusFg(s))),
  );

  @override
  Widget build(BuildContext context) {
    final bottomPad =
        MediaQuery.of(context).padding.bottom + kBottomNavigationBarHeight / 2;

    return Padding(
      padding: EdgeInsets.fromLTRB(
        UISizes.defaultSpace,
        UISizes.defaultSpace,
        UISizes.defaultSpace,
        bottomPad,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Row(
            children: [
              Expanded(
                child: Text(
                  'Riwayat Pembelian',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: UISizes.md,
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              IconButton(
                tooltip: 'Refresh',
                icon: const Icon(Icons.refresh),
                color: UIColors.mainRed,
                onPressed: _fetch,
              ),
            ],
          ),
          const SizedBox(height: UISizes.spaceBtwItems),

          if (_loading)
            const Expanded(child: Center(child: CircularProgressIndicator()))
          else if (_error.isNotEmpty)
            Expanded(
              child: _ErrorView(message: _error, onRetry: _fetch),
            )
          else if (_items.isEmpty)
            const Expanded(child: _EmptyView())
          else
            Expanded(
              child: RefreshIndicator(
                onRefresh: _fetch,
                child: ListView.separated(
                  physics: const AlwaysScrollableScrollPhysics(),
                  itemCount: _items.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 10),
                  itemBuilder: (context, i) {
                    final p = _items[i];
                    final img = (p.product.images.isNotEmpty)
                        ? p.product.images.first
                        : null;
                    final productType = p.product.type.label;
                    final amount = _fmtMoney(p.amount);
                    final time = _fmtTime(p.createdAt);

                    return InkWell(
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => DetailPaymentScreen(id: p.id),
                          ),
                        );
                        _fetch();
                      },
                      child: Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(12),
                          boxShadow: const [
                            BoxShadow(
                              color: Color.fromRGBO(0, 0, 0, 0.05),
                              blurRadius: 4,
                              offset: Offset(0, 2),
                            ),
                          ],
                          border: Border.all(color: Colors.black12),
                        ),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // leading image
                            ClipRRect(
                              borderRadius: BorderRadius.circular(8),
                              child: (img != null && img.isNotEmpty)
                                  ? Image.network(
                                      img,
                                      width: 56,
                                      height: 56,
                                      fit: BoxFit.cover,
                                      errorBuilder: (_, __, ___) =>
                                          _imgPlaceholder(),
                                    )
                                  : _imgPlaceholder(),
                            ),
                            const SizedBox(width: 12),
                            // main
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  // title
                                  Text(
                                    p.product.name.isEmpty
                                        ? '(Tanpa Nama)'
                                        : p.product.name,
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                    style: const TextStyle(
                                      fontWeight: FontWeight.w600,
                                      fontSize: 14,
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  // meta row
                                  Wrap(
                                    spacing: 8,
                                    runSpacing: 6,
                                    crossAxisAlignment:
                                        WrapCrossAlignment.center,
                                    children: [
                                      _statusChip(p.status),
                                      Text(
                                        productType,
                                        style: TextStyle(
                                          fontSize: 12,
                                          color: Colors.grey[700],
                                        ),
                                      ),
                                      Text(
                                        time,
                                        style: const TextStyle(
                                          fontSize: 12,
                                          color: Colors.black54,
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(width: 12),
                            // amount + chevron
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.end,
                              children: [
                                Text(
                                  amount,
                                  style: TextStyle(
                                    fontWeight: FontWeight.bold,
                                    color: UIColors.mainRed,
                                  ),
                                ),
                                const SizedBox(height: 8),
                                const Icon(
                                  Icons.chevron_right,
                                  color: Colors.black45,
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _imgPlaceholder() => Container(
    width: 56,
    height: 56,
    color: Colors.black12,
    child: const Icon(Icons.broken_image, color: Colors.black45),
  );
}

class _EmptyView extends StatelessWidget {
  const _EmptyView();

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.receipt_long, size: 64, color: Colors.grey[400]),
          const SizedBox(height: 12),
          Text(
            'Belum ada riwayat pembelian',
            style: TextStyle(fontSize: 16, color: Colors.grey[700]),
          ),
          const SizedBox(height: 6),
          Text(
            'Transaksi yang kamu lakukan akan muncul di sini',
            style: TextStyle(fontSize: 13, color: Colors.grey[600]),
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
