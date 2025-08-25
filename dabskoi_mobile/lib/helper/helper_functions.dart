import 'package:flutter/material.dart';

class HelperFunctions {
  static bool isDarkMode(BuildContext context) {
    return Theme.of(context).brightness == Brightness.dark;
  }

  static Size screenSize(BuildContext context) {
    return MediaQuery.of(context).size;
  }

  static double screenHeight(BuildContext context) {
    return MediaQuery.of(context).size.height;
  }

  static double screenWidth(BuildContext context) {
    return MediaQuery.of(context).size.width;
  }

  static double responsiveWidth(BuildContext context, double manualWidth) {
    return manualWidth *
        (MediaQuery.of(context).size.width / 360); // 360 = target lebar
  }

  static double responsiveHeight(BuildContext context, double manualHeight) {
    return manualHeight *
        (MediaQuery.of(context).size.height / 640); // 640 = target tinggi
  }
}
