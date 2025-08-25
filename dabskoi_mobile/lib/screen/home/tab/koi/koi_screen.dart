import 'package:dabskoi/services/koi_service.dart';
import 'package:dabskoi/models/koi_responses.dart';
import 'package:flutter/material.dart';
import 'package:carousel_slider/carousel_slider.dart';
import 'package:dabskoi/screen/home/tab/koi/koi_detail_screen.dart';

class KoiScreen extends StatefulWidget {
  const KoiScreen({super.key});

  @override
  State<KoiScreen> createState() => _KoiScreenState();
}

class _KoiScreenState extends State<KoiScreen> {
  final TextEditingController _searchController = TextEditingController();
  String _activeFilter = "Lelang";
  final Color primaryColor = const Color(0xFFBB0000);

  bool _isLoading = true;

  // tiga tipe list
  List<KoiResponse> _sells = [];
  List<KoiResponse> _negos = [];
  List<KoiResponse> _auctions = [];

  // filtered (sesuai tab aktif)
  List<KoiResponse> _filtered = [];

  @override
  void initState() {
    super.initState();
    _fetchAll();
  }

  Future<void> _fetchAll() async {
    setState(() {
      _isLoading = true;
    });

    final svc = KoiService();
    final sells = await svc.getKoiSellList();
    final negos = await svc.getKoiNegoList();
    final auctions = await svc.getKoiAuctionList();

    setState(() {
      _sells = sells;
      _negos = negos;
      _auctions = auctions;
      _applyFilter();
      _isLoading = false;
    });
  }

  void _applyFilter() {
    switch (_activeFilter) {
      case "Lelang":
        _filtered = List.from(_auctions);
        break;
      case "Negosiasi":
        _filtered = List.from(_negos);
        break;
      case "Jual Beli":
        _filtered = List.from(_sells);
        break;
    }
  }

  void _onTapFilter(String text) {
    setState(() {
      _activeFilter = text;
      _searchController.clear();
      _applyFilter();
    });
  }

  void _filterKoiListings(String s) {
    final q = s.toLowerCase();
    final base = (_activeFilter == "Lelang")
        ? _auctions
        : _activeFilter == "Negosiasi"
        ? _negos
        : _sells;

    setState(() {
      if (q.isEmpty) {
        _filtered = List.from(base);
      } else {
        _filtered = base.where((k) {
          final gender = k.gender.label.toLowerCase();
          return k.id.toLowerCase().contains(q) ||
              k.name.toLowerCase().contains(q) ||
              k.type.toLowerCase().contains(q) ||
              gender.contains(q) ||
              k.description.toLowerCase().contains(q) ||
              k.price.toString().contains(q);
        }).toList();
      }
    });
  }

  String _fmtPrice(num v) => 'Rp ${v.toStringAsFixed(0)}';

  Widget _buildFilterButton(String text) {
    final isActive = _activeFilter == text;
    return InkWell(
      onTap: () => _onTapFilter(text),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: isActive ? primaryColor : Colors.white,
          borderRadius: BorderRadius.circular(5),
          border: Border.all(color: primaryColor),
        ),
        child: Text(
          text,
          style: TextStyle(
            color: isActive ? Colors.white : primaryColor,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
    );
  }

  Widget _buildKoiCard(KoiResponse koi) {
    final isAuction = _activeFilter == "Lelang";

    // === CTA mapping by status (tanpa cek tanggal) ===
    String ctaText = 'Lihat Detail';
    bool ctaEnabled = true;
    Color ctaColor = primaryColor;

    if (isAuction) {
      switch (koi.status) {
        case KoiStatus.AKTIF:
          ctaText = 'Ikut Lelang';
          ctaEnabled = true;
          ctaColor = primaryColor;
          break;
        case KoiStatus.BELUM_DIMULAI:
          ctaText = 'Belum Dimulai';
          ctaEnabled = false;
          ctaColor = Colors.grey;
          break;
        case KoiStatus.SELESAI:
          ctaText = 'Lelang Selesai';
          ctaEnabled = false;
          ctaColor = Colors.grey;
          break;
        case KoiStatus.DIHAPUS:
          ctaText = 'Dihapus';
          ctaEnabled = false;
          ctaColor = Colors.grey;
          break;
      }
    }

    return Container(
      margin: const EdgeInsets.symmetric(vertical: 15, horizontal: 20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(10),
        boxShadow: const [
          BoxShadow(
            color: Color.fromRGBO(158, 158, 158, 0.1),
            spreadRadius: 1,
            blurRadius: 2,
            offset: Offset(0, 1),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // header
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // left info
                Expanded(
                  flex: 3,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        koi.name,
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Text(
                        koi.gender.label,
                        style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                      ),
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          Icon(Icons.straighten, size: 16, color: Colors.grey),
                          SizedBox(width: 4),
                          Text(
                            '${koi.length} cm',
                            style: const TextStyle(fontSize: 12),
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          Icon(
                            Icons.monitor_weight_outlined,
                            size: 16,
                            color: Colors.grey,
                          ),
                          SizedBox(width: 4),
                          Text(
                            '${koi.weight} g',
                            style: const TextStyle(fontSize: 12),
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          Icon(
                            Icons.bookmark_outline,
                            size: 16,
                            color: Colors.grey,
                          ),
                          SizedBox(width: 4),
                          Text(
                            koi.status.label,
                            style: const TextStyle(fontSize: 12),
                          ),
                        ],
                      ),
                      if (isAuction &&
                          koi.startAt != null &&
                          koi.endAt != null) ...[
                        const SizedBox(height: 4),
                        Row(
                          children: [
                            Icon(Icons.schedule, size: 16, color: Colors.grey),
                            SizedBox(width: 4),
                            Text(
                              '${koi.startAt!.toLocal().toString().split(':')[0]}:${koi.startAt!.toLocal().toString().split(':')[1]}',
                              style: const TextStyle(fontSize: 12),
                            ),
                          ],
                        ),
                        // Simple "yyyy-mm-dd hh:mm" (hide seconds)
                        const SizedBox(height: 4),
                        Row(
                          children: [
                            Icon(Icons.schedule, size: 16, color: Colors.grey),
                            SizedBox(width: 4),
                            Text(
                              '${koi.endAt!.toLocal().toString().split(':')[0]}:${koi.endAt!.toLocal().toString().split(':')[1]}',
                              style: const TextStyle(fontSize: 12),
                            ),
                          ],
                        ),
                      ],
                    ],
                  ),
                ),
                // right price + slider
                Expanded(
                  flex: 3,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text(
                        isAuction ? 'Harga Awal' : 'Harga',
                        style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                      ),
                      Text(
                        _fmtPrice(koi.price),
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: primaryColor,
                        ),
                      ),
                      const SizedBox(height: 8),
                      if (koi.images.isNotEmpty)
                        CarouselSlider(
                          options: CarouselOptions(
                            height: 100,
                            viewportFraction: 0.8,
                            enlargeCenterPage: true,
                          ),
                          items: koi.images.map((url) {
                            return Builder(
                              builder: (context) {
                                return Container(
                                  margin: const EdgeInsets.symmetric(
                                    horizontal: 5,
                                  ),
                                  decoration: BoxDecoration(
                                    color: Colors.black12,
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: ClipRRect(
                                    borderRadius: BorderRadius.circular(8),
                                    child: Image.network(
                                      url,
                                      fit: BoxFit.cover,
                                      width: double.infinity,
                                      errorBuilder: (_, __, ___) =>
                                          const Center(
                                            child: Icon(Icons.broken_image),
                                          ),
                                    ),
                                  ),
                                );
                              },
                            );
                          }).toList(),
                        ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          // CTA
          InkWell(
            onTap: () async {
              if (!ctaEnabled) {
                ScaffoldMessenger.of(
                  context,
                ).showSnackBar(SnackBar(content: Text(ctaText)));
                return;
              } else {
                await Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => KoiDetailScreen(
                      id: koi.id,
                      type: _activeFilter == "Lelang"
                          ? KoiFetchType.auctions
                          : _activeFilter == "Negosiasi"
                          ? KoiFetchType.negos
                          : KoiFetchType.sells,
                    ),
                  ),
                );

                if (!mounted) return;

                // refresh SELALU saat kembali dari detail
                // (kalau mau hanya saat detail mengirim "SHOULD_REFRESH", ganti ke: if (result == "SHOULD_REFRESH") ...)
                await _fetchAll();
              }
            },
            child: Container(
              alignment: Alignment.center,
              decoration: BoxDecoration(
                color: ctaColor,
                borderRadius: const BorderRadius.only(
                  bottomLeft: Radius.circular(10),
                  bottomRight: Radius.circular(10),
                ),
              ),
              padding: const EdgeInsets.symmetric(vertical: 10),
              child: Text(
                ctaText,
                style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final list = _filtered;

    return Scaffold(
      backgroundColor: Colors.grey[100],
      appBar: PreferredSize(
        preferredSize: const Size.fromHeight(60),
        child: AppBar(
          backgroundColor: Colors.white,
          elevation: 0,
          title: Container(
            height: 40,
            margin: const EdgeInsets.only(top: 8, bottom: 8, right: 10),
            decoration: BoxDecoration(
              border: Border.all(color: primaryColor),
              borderRadius: BorderRadius.circular(25),
            ),
            child: TextField(
              controller: _searchController,
              decoration: InputDecoration(
                hintText: 'Cari koi…',
                prefixIcon: Icon(Icons.search, color: primaryColor),
                border: InputBorder.none,
                contentPadding: const EdgeInsets.symmetric(vertical: 10),
              ),
              onChanged: _filterKoiListings,
            ),
          ),
          actions: const [
            // tambahkan action lain jika perlu
          ],
        ),
      ),
      body: Column(
        children: [
          // Filter
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Row(
              children: [
                _buildFilterButton("Lelang"),
                const SizedBox(width: 10),
                _buildFilterButton("Negosiasi"),
                const SizedBox(width: 10),
                _buildFilterButton("Jual Beli"),
              ],
            ),
          ),
          // List
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : (list.isEmpty)
                ? const Center(child: Text('Tidak ada koi yang cocok'))
                : ListView.builder(
                    itemCount: list.length,
                    itemBuilder: (_, i) => _buildKoiCard(list[i]),
                  ),
          ),
        ],
      ),
    );
  }
}
