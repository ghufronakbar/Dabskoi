import 'package:dabskoi/data/carousel_data.dart';
import 'package:dabskoi/helper/helper_functions.dart';
import 'package:dabskoi/helper/image_viewer_helper.dart';
import 'package:flutter/material.dart';
import 'package:carousel_slider/carousel_slider.dart';

class HomeCarousel extends StatefulWidget {
  const HomeCarousel({super.key});

  @override
  State<HomeCarousel> createState() => _HomeCarouselState();
}

class _HomeCarouselState extends State<HomeCarousel> {
  late CarouselSliderController carouselController;
  int currentPage = 0;

  @override
  void initState() {
    carouselController = CarouselSliderController();
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: HelperFunctions.screenHeight(context) * 0.3,
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(0),
            child: Text(
              "",
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.w500),
            ),
          ),
          Expanded(
            child: Stack(
              alignment: Alignment.center,
              children: [
                CarouselSlider(
                  carouselController: carouselController,
                  items: CarouselData.carouselImage.map((imagePath) {
                    return Builder(
                      builder: (context) {
                        return ImageViewerHelper.show(
                          context: context,
                          url: imagePath,
                          fit: BoxFit.cover,
                        );
                      },
                    );
                  }).toList(),
                  options: CarouselOptions(
                    enlargeCenterPage: true,
                    autoPlay: true,
                    enableInfiniteScroll: true,
                    viewportFraction: 0.8,
                    onPageChanged: (index, reason) {
                      setState(() {
                        currentPage = index;
                      });
                    },
                  ),
                ),
                Positioned(
                  bottom: 8, // Ubah ke nilai tetap
                  child: Row(
                    children: List.generate(CarouselData.carouselImage.length, (
                      index,
                    ) {
                      bool isSelected = currentPage == index;
                      return GestureDetector(
                        onTap: () {
                          carouselController.animateToPage(index);
                        },
                        child: AnimatedContainer(
                          width: isSelected ? 55 : 17,
                          margin: EdgeInsets.symmetric(
                            horizontal: isSelected ? 6 : 3,
                          ),
                          height: 10,
                          duration: const Duration(milliseconds: 300),
                          decoration: BoxDecoration(
                            color: isSelected
                                ? Colors.white
                                : Colors.grey.shade200,
                            borderRadius: BorderRadius.circular(40),
                          ),
                        ),
                      );
                    }),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
