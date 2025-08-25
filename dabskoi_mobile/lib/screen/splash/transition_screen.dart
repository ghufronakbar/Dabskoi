import 'dart:async';
import 'package:dabskoi/helper/colors.dart';
import 'package:dabskoi/helper/images_string.dart';
import 'package:dabskoi/screen/splash/_widgets/onboarding_screen.dart';
import 'package:flutter/material.dart';

class TransitionScreen extends StatelessWidget {
  const TransitionScreen({super.key});

  @override
  Widget build(BuildContext context) {
    Timer(Duration(seconds: 3), () {
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (context) => OnboardingScreen()),
      );
    });

    return Scaffold(
      backgroundColor: UIColors.transitionBackgroundScreen,
      body: Center(
        child: Image.asset(
          ImagesString.dabKoiHouseLogo,
          width: 277,
          height: 277,
        ),
      ),
    );
  }
}
