import 'package:dabskoi/helper/sizes.dart';
import 'package:flutter/material.dart';

class LoginSignUpButton extends StatelessWidget {
  const LoginSignUpButton({
    super.key,
    required this.borderSide,
    required this.backgroundColor,
    required this.text,
    required this.fontColor,
    required this.onPressed,
  });

  final BorderSide borderSide;
  final Color backgroundColor;
  final String text;
  final Color fontColor;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      child: ElevatedButton(
        style: ElevatedButton.styleFrom(
          backgroundColor: backgroundColor,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(UISizes.borderRadiusMd),
            side: borderSide,
          ),
        ),
        onPressed: onPressed,
        child: Text(
          text,
          style: TextStyle(
            fontWeight: FontWeight.bold,
            fontSize: 20,
            color: fontColor,
          ),
        ),
      ),
    );
  }
}
