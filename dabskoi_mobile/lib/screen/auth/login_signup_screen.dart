import 'dart:developer';

import 'package:dabskoi/helper/colors.dart';
import 'package:dabskoi/helper/images_string.dart';
import 'package:dabskoi/helper/sizes.dart';
import 'package:dabskoi/helper/helper_functions.dart';
import 'package:dabskoi/screen/auth/_widgets/login_signup_button.dart';
import 'package:dabskoi/screen/auth/login_screen.dart';
import 'package:dabskoi/screen/auth/signup_screen.dart';
import 'package:flutter/material.dart';

class LoginSignUpScreen extends StatelessWidget {
  const LoginSignUpScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: UIColors.mainWhite,
      body: Padding(
        padding: const EdgeInsets.all(UISizes.xl),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Image(
              width: HelperFunctions.responsiveWidth(context, 274), // 0.8
              height: HelperFunctions.responsiveHeight(context, 210), // 0.6
              image: AssetImage(ImagesString.loginSignUpImage),
            ),
            SizedBox(height: UISizes.spaceBtwSections),

            // login button
            LoginSignUpButton(
              borderSide: BorderSide(
                width: UISizes.borderSideSm,
                color: UIColors.mainRed,
              ),
              backgroundColor: UIColors.mainWhite,
              text: "Login",
              fontColor: UIColors.mainRed,
              onPressed: () {
                Navigator.pushReplacement(
                  context,
                  MaterialPageRoute(builder: (context) => LoginScreen()),
                );
              },
            ),

            // gap
            SizedBox(height: UISizes.spaceBtwItems),

            // sign up button
            LoginSignUpButton(
              borderSide: BorderSide.none,
              backgroundColor: UIColors.mainRed,
              text: "Sign Up",
              fontColor: UIColors.mainWhite,
              onPressed: () {
                // login sign up
                Navigator.pushReplacement(
                  context,
                  MaterialPageRoute(builder: (context) => SignupScreen()),
                );
                log("Berhasil Sign Up");
              },
            ),
          ],
        ),
      ),
    );
  }
}
