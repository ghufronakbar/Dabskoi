// lib/widgets/home_bid.dart (atau lokasi yang Anda inginkan)
import 'package:dabskoi/screen/home/tab/koi/koi_detail_screen.dart';
import 'package:flutter/material.dart';
import 'package:dabskoi/helper/colors.dart';
import 'package:dabskoi/helper/sizes.dart';
import 'package:dabskoi/services/koi_service.dart';
import 'package:dabskoi/models/koi_responses.dart';

class HomeAuction extends StatefulWidget {
  const HomeAuction({super.key});

  @override
  State<HomeAuction> createState() => _HomeAuctionState();
}

class _HomeAuctionState extends State<HomeAuction> {
  bool _isLoading = true;
  String _error = '';
  KoiResponse? _featured;

  @override
  void initState() {
    super.initState();
    _fetchAuctions();
  }

  Future<void> _fetchAuctions() async {
    setState(() {
      _isLoading = true;
      _error = '';
    });
    try {
      final list = await KoiService().getKoiAuctionList();
      final filtered = list
          .where((k) => k.status != KoiStatus.SELESAI)
          .toList();
      KoiResponse? chosen;
      if (filtered.isNotEmpty) {
        filtered.sort((a, b) {
          final ah = (a.highestBid ?? 0).compareTo(b.highestBid ?? 0);
          return -ah;
        });
        chosen = filtered.first;
      }

      setState(() {
        _featured = chosen;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = 'Gagal memuat data lelang: $e';
        _isLoading = false;
      });
    }
  }

  String _fmtPrice(num? v) {
    if (v == null) return '—';
    return 'Rp ${v.toStringAsFixed(0)}';
  }

  String _fmtDateShort(DateTime? dt) {
    if (dt == null) return '-';
    final s = dt.toLocal().toString().split(':');
    // yyyy-mm-dd hh:mm
    return '${s[0]}:${s[1]}';
  }

  // CTA label berdasarkan status
  String _ctaText(KoiStatus s) {
    switch (s) {
      case KoiStatus.BELUM_DIMULAI:
        return 'Belum dimulai';
      case KoiStatus.AKTIF:
        return 'Ikut Bid';
      case KoiStatus.SELESAI:
        return 'Bid selesai';
      case KoiStatus.DIHAPUS:
        return 'Tidak tersedia';
    }
  }

  bool _ctaEnabled(KoiStatus s) => s == KoiStatus.AKTIF;

  Color _ctaColor(KoiStatus s) =>
      _ctaEnabled(s) ? UIColors.mainRed : UIColors.dotColors;

  @override
  Widget build(BuildContext context) {
    final koi = _featured;

    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Align(
          alignment: Alignment.centerLeft,
          child: Text(
            'Lelang Tersedia',
            style: TextStyle(fontWeight: FontWeight.bold, fontSize: UISizes.md),
          ),
        ),
        SizedBox(height: UISizes.md),

        // konten
        if (_isLoading)
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: UIColors.mainWhite,
              borderRadius: BorderRadius.circular(UISizes.borderRadiusMd),
              boxShadow: const [
                BoxShadow(
                  color: Color.fromRGBO(0, 0, 0, 0.25),
                  blurRadius: 6,
                  offset: Offset(2, 4),
                ),
              ],
            ),
            child: const Center(child: CircularProgressIndicator()),
          )
        else if (_error.isNotEmpty)
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.red[50],
              border: Border.all(color: Colors.red),
              borderRadius: BorderRadius.circular(UISizes.borderRadiusMd),
              boxShadow: const [
                BoxShadow(
                  color: Color.fromRGBO(0, 0, 0, 0.1),
                  blurRadius: 4,
                  offset: Offset(1, 3),
                ),
              ],
            ),
            child: Text(_error, style: const TextStyle(color: Colors.red)),
          )
        else if (koi == null)
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: UIColors.mainWhite,
              borderRadius: BorderRadius.circular(UISizes.borderRadiusMd),
              boxShadow: const [
                BoxShadow(
                  color: Color.fromRGBO(0, 0, 0, 0.1),
                  blurRadius: 4,
                  offset: Offset(1, 3),
                ),
              ],
            ),
            child: const Center(child: Text('Tidak ada lelang tersedia')),
          )
        else
          Container(
            width: double.infinity,
            decoration: BoxDecoration(
              color: UIColors.mainWhite,
              borderRadius: BorderRadius.circular(UISizes.borderRadiusMd),
              boxShadow: const [
                BoxShadow(
                  color: Color.fromRGBO(0, 0, 0, 0.25),
                  blurRadius: 6,
                  offset: Offset(2, 4),
                ),
              ],
            ),
            child: Padding(
              padding: const EdgeInsets.all(UISizes.md),
              child: Column(
                children: [
                  // Header: nama, gender, highest bid
                  Padding(
                    padding: const EdgeInsets.only(bottom: UISizes.md),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        // kiri
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              koi.name,
                              style: TextStyle(
                                fontSize: UISizes.md,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            Text(
                              koi.gender.label,
                              style: TextStyle(
                                fontSize: UISizes.cardRadiusMd,
                                fontWeight: FontWeight.w500,
                                color: UIColors.dotColors,
                              ),
                            ),
                          ],
                        ),
                        // kanan
                        Row(
                          children: [
                            Text(
                              "Tawaran Tertinggi",
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: UISizes.cardRadiusMd,
                              ),
                            ),
                            SizedBox(width: UISizes.cardRadiusLg),
                            Text(
                              koi.highestBid != null && koi.highestBid! > 0
                                  ? _fmtPrice(koi.highestBid)
                                  : 'Belum ada',
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: UISizes.cardRadiusMd,
                                color: UIColors.mainRed,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),

                  // Body: spesifikasi kiri + gambar kanan
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      // spesifikasi
                      Expanded(
                        flex: 1,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            _specRow(
                              icon: Icons.straighten,
                              text: '${koi.length} cm',
                            ),
                            _specRow(
                              icon: Icons.monitor_weight_outlined,
                              text: '${koi.weight} g',
                            ),
                            _specRow(
                              icon: Icons.bookmark_outline,
                              text: koi.status.label,
                            ),
                            _specRow(
                              icon: Icons.calendar_month,
                              text: _fmtDateShort(koi.startAt),
                            ),
                            _specRow(
                              icon: Icons.calendar_month_outlined,
                              text: _fmtDateShort(koi.endAt),
                            ),
                            const SizedBox(height: 4),
                            // info harga awal
                            Text(
                              'Harga awal: ${_fmtPrice(koi.price)}',
                              style: TextStyle(
                                fontSize: UISizes.cardRadiusMd,
                                color: Colors.black.withOpacity(0.6),
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ],
                        ),
                      ),
                      SizedBox(width: UISizes.md),

                      // gambar
                      Expanded(
                        flex: 1,
                        child: Column(
                          children: [
                            Container(
                              height: 100,
                              width: double.infinity,
                              decoration: BoxDecoration(
                                borderRadius: BorderRadius.circular(
                                  UISizes.borderRadiusMd,
                                ),
                              ),
                              clipBehavior: Clip.antiAlias,
                              child: (koi.images.isNotEmpty)
                                  ? Image.network(
                                      koi.images.first,
                                      fit: BoxFit.cover,
                                      errorBuilder: (_, __, ___) => Image.asset(
                                        'assets/carousel/koi_image.png',
                                        fit: BoxFit.cover,
                                      ),
                                    )
                                  : Image.asset(
                                      'assets/carousel/koi_image.png',
                                      fit: BoxFit.cover,
                                    ),
                            ),
                            SizedBox(height: UISizes.sm),
                            // CTA
                            ElevatedButton(
                              style: ElevatedButton.styleFrom(
                                backgroundColor: _ctaColor(koi.status),
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 20,
                                  vertical: 6,
                                ),
                                minimumSize: Size.zero,
                                tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(
                                    UISizes.borderRadiusMd,
                                  ),
                                ),
                              ),
                              onPressed: _ctaEnabled(koi.status)
                                  ? () async {
                                      Navigator.push(
                                        context,
                                        MaterialPageRoute(
                                          builder: (_) => KoiDetailScreen(
                                            id: koi.id,
                                            type: KoiFetchType.auctions,
                                          ),
                                        ),
                                      );
                                    }
                                  : null,
                              child: Text(
                                _ctaText(koi.status),
                                style: TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 14,
                                  color: UIColors.mainWhite,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),

        // (Opsional) tombol refresh mini
        const SizedBox(height: 8),
        Align(
          alignment: Alignment.centerRight,
          child: TextButton.icon(
            onPressed: _fetchAuctions,
            icon: const Icon(Icons.refresh, size: 16),
            label: const Text('Refresh'),
          ),
        ),
      ],
    );
  }

  Widget _specRow({required IconData icon, required String text}) {
    return Row(
      children: [
        Icon(icon, color: UIColors.dotColors, size: UISizes.iconMd),
        SizedBox(width: UISizes.sm),
        Text(
          text,
          style: TextStyle(
            fontSize: UISizes.cardRadiusMd,
            fontWeight: FontWeight.w600,
            color: UIColors.dotColors,
          ),
        ),
      ],
    );
  }
}
