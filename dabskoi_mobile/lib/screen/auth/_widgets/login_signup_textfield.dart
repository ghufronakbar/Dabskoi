import 'package:dabskoi/helper/colors.dart';
import 'package:dabskoi/helper/sizes.dart';
import 'package:flutter/material.dart';

class LoginSignupTextfield extends StatelessWidget {
  const LoginSignupTextfield({
    super.key,
    required this.controller,
    required this.obsecureText,
    required this.hint,
    this.maxLines,
    this.minLines,
  });

  final TextEditingController controller;
  final bool obsecureText;
  final String hint;
  final int? maxLines;
  final int? minLines;

  @override
  Widget build(BuildContext context) {
    return TextField(
      controller: controller,
      keyboardType: TextInputType.text,
      obscureText: obsecureText,
      maxLines: obsecureText ? 1 : maxLines,
      minLines: obsecureText ? 1 : minLines,
      decoration: InputDecoration(
        hintText: hint,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.all(
            Radius.circular(UISizes.borderRadiusMd),
          ),
        ),
        fillColor: UIColors.loginTextField,
        filled: true,
      ),
    );
  }
}
