import 'package:dabskoi/helper/colors.dart';
import 'package:dabskoi/helper/notify_snack_bar.dart';
import 'package:dabskoi/helper/sizes.dart';
import 'package:dabskoi/screen/auth/_widgets/login_signup_textfield.dart';
import 'package:dabskoi/screen/auth/signup_screen.dart';
import 'package:dabskoi/screen/home/main_tab.dart';
import 'package:dabskoi/services/account_service.dart';
import 'package:dabskoi/models/account_requests.dart';
import 'package:flutter/material.dart';

class LoginBottomSection extends StatelessWidget {
  LoginBottomSection({
    super.key,
    required TextEditingController emailController,
    required TextEditingController passwordController,
  }) : _emailController = emailController,
       _passwordController = passwordController;

  final TextEditingController _emailController;
  final TextEditingController _passwordController;

  final accountService = AccountService();

  // function to login
  Future<void> login(BuildContext context) async {
    try {
      await accountService.login(
        PostLoginRequest(
          email: _emailController.text.trim(),
          password: _passwordController.text.trim(),
        ),
      );
      NotifySnackBar.showSuccess(context, "Berhasil Login");
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (context) => MainTab()),
      );
    } catch (e) {
      NotifySnackBar.showError(context, e);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: LayoutBuilder(
        builder: (context, constraints) {
          return Container(
            width: double.infinity,
            height: constraints.maxHeight,
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(UISizes.borderRadiusLg),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withAlpha(64),
                  spreadRadius: 0,
                  blurRadius: 32.7,
                  offset: Offset(0, 1),
                ),
                BoxShadow(
                  color: Color.fromRGBO(0, 0, 0, 0.25),
                  spreadRadius: 0,
                  blurRadius: 32.7,
                  offset: Offset(0, 1),
                ),
              ],
            ),
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(
                vertical: UISizes.spaceBtwSections,
                horizontal: UISizes.defaultSpace,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    "Email",
                    style: TextStyle(
                      color: Colors.black,
                      fontSize: UISizes.fontSizeSm,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  SizedBox(height: UISizes.sm),
                  LoginSignupTextfield(
                    controller: _emailController,
                    obsecureText: false,
                    hint: "Masukkan Email",
                  ),

                  // Password
                  SizedBox(height: UISizes.sm),
                  Text(
                    "Password",
                    style: TextStyle(
                      color: Colors.black,
                      fontSize: UISizes.fontSizeSm,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  SizedBox(height: UISizes.sm),
                  LoginSignupTextfield(
                    controller: _passwordController,
                    obsecureText: true,
                    hint: "Masukkan Password",
                  ),

                  // Forgot password
                  SizedBox(height: UISizes.sm),
                  Align(
                    alignment: Alignment.centerRight,
                    child: Text(
                      "Lupa Password?",
                      style: TextStyle(
                        color: UIColors.mainBlue,
                        fontSize: UISizes.fontSizeSm,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),

                  // Login Button
                  SizedBox(height: UISizes.sm),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: UIColors.mainRed,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(
                            UISizes.borderRadiusMd,
                          ),
                        ),
                      ),
                      onPressed: () => login(context),
                      child: Text(
                        "Login",
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 20,
                          color: UIColors.mainWhite,
                        ),
                      ),
                    ),
                  ),

                  // Sign Up Text Trigger
                  SizedBox(height: UISizes.xl),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        "Belum Punya Akun?",
                        style: TextStyle(
                          color: Colors.black,
                          fontSize: UISizes.fontSizeMd,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      SizedBox(width: UISizes.sm),
                      InkWell(
                        onTap: () {
                          Navigator.pushReplacement(
                            context,
                            MaterialPageRoute(
                              builder: (context) => SignupScreen(),
                            ),
                          );
                        },
                        child: Text(
                          "Daftar",
                          style: TextStyle(
                            color: UIColors.mainBlue,
                            fontSize: UISizes.fontSizeMd,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}
