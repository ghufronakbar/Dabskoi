import 'package:dabskoi/models/koi_responses.dart';
import 'package:dabskoi/screen/home/tab/koi/koi_detail_screen.dart';
import 'package:dabskoi/services/koi_service.dart';
import 'package:flutter/material.dart';

class KoiSellWidget extends StatelessWidget {
  const KoiSellWidget({super.key, required this.koi, required this.textSize});

  final KoiResponse koi;
  final double textSize;

  String _formatCurrency(int amount) {
    final format = RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))');
    return amount.toString().replaceAllMapped(format, (Match m) => '${m[1]}.');
  }

  String _formatLength(double length) {
    return '${length.toStringAsFixed(1)} Cm';
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (_) =>
                KoiDetailScreen(id: koi.id, type: KoiFetchType.sells),
          ),
        );
      },
      child: Card(
        elevation: 2,
        clipBehavior: Clip.antiAlias,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            // Image container with aspect ratio
            AspectRatio(
              aspectRatio: 4 / 3,
              child: Container(
                decoration: BoxDecoration(
                  color: Colors.grey[200], // fallback color
                ),
                child: koi.images.isNotEmpty
                    ? Image.network(
                        koi.images.first,
                        fit: BoxFit.cover,
                        errorBuilder: (context, error, stackTrace) {
                          return Image.asset(
                            'assets/carousel/koi_image.png',
                            fit: BoxFit.cover,
                          );
                        },
                      )
                    : Image.asset(
                        'assets/carousel/koi_image.png',
                        fit: BoxFit.cover,
                      ),
              ),
            ),

            Padding(
              padding: const EdgeInsets.all(8.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Title
                  Text(
                    koi.name,
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 14,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 4),

                  // Gender and Size
                  Text(
                    koi.gender.label,
                    style: const TextStyle(fontSize: 12, color: Colors.grey),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 4),

                  // Length and Price
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        _formatLength(koi.length.toDouble()),
                        style: const TextStyle(fontSize: 12),
                      ),
                      Text(
                        _formatCurrency(koi.price.toInt()),
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 14,
                          color: Color(
                            0xFFBB0000,
                          ), // Primary color from KoiBuyDetailScreen
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
    );
  }
}
