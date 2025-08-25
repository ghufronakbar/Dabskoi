import 'dart:async';
import 'package:dabskoi/core/token_storage.dart';
import 'package:dabskoi/helper/colors.dart';
import 'package:dabskoi/helper/images_string.dart';
import 'package:dabskoi/screen/auth/login_signup_screen.dart';
import 'package:dabskoi/screen/home/main_tab.dart';

import 'package:flutter/material.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<Offset> _leftFishAnimation;
  late Animation<Offset> _rightFishAnimation;

  void _checkToken() async {
    final token = await TokenStorage.read();
    if (token != null) {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (context) => MainTab()),
      );
    } else {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (context) => LoginSignUpScreen()),
      );
    }
  }

  @override
  void initState() {
    super.initState();

    _controller = AnimationController(
      vsync: this,
      duration: Duration(seconds: 1), // Bisa disesuaikan kecepatannya
    );

    _leftFishAnimation = Tween<Offset>(
      begin: Offset(-1.5, 1.5), // Pojok kiri bawah
      end: Offset(-0.2, 0.01), // Menuju tengah
    ).animate(CurvedAnimation(parent: _controller, curve: Curves.easeInOut));

    _rightFishAnimation = Tween<Offset>(
      begin: Offset(1.5, -1.5), // Pojok kanan atas
      end: Offset(0.2, -0.01), // Menuju tengah
    ).animate(CurvedAnimation(parent: _controller, curve: Curves.easeInOut));

    _controller.forward();

    Timer(Duration(seconds: 3), () {
      _checkToken();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [UIColors.redGradient, UIColors.greyGradient],
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
        ),
      ),
      child: Scaffold(
        backgroundColor: Colors.transparent,
        body: Center(
          child: Stack(
            children: [
              SlideTransition(
                position: _leftFishAnimation,
                child: Transform.translate(
                  offset: Offset(-10, 10), // Menyesuaikan jarak ikan kiri
                  child: Image.asset(
                    ImagesString.splashKoiImage,
                    width: 150,
                    height: 150,
                  ),
                ),
              ),
              SlideTransition(
                position: _rightFishAnimation,
                child: Transform.translate(
                  offset: Offset(10, -10), // Menyesuaikan jarak ikan kanan
                  child: Transform.rotate(
                    angle: 3.1416,
                    child: Image.asset(
                      ImagesString.splashKoiImage,
                      width: 150,
                      height: 150,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
