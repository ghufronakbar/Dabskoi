import 'package:dabskoi/helper/colors.dart';
import 'package:dabskoi/helper/notify_snack_bar.dart';
import 'package:dabskoi/helper/sizes.dart';
import 'package:dabskoi/screen/auth/_widgets/login_signup_textfield.dart';
import 'package:dabskoi/screen/auth/login_screen.dart';
import 'package:dabskoi/screen/home/main_tab.dart';
import 'package:dabskoi/services/account_service.dart';
import 'package:dabskoi/models/account_requests.dart';
import 'package:flutter/material.dart';

class SignupBottomSection extends StatelessWidget {
  final TextEditingController nameController;
  final TextEditingController emailController;
  final TextEditingController phoneNumberController;
  final TextEditingController passwordController;
  final TextEditingController confirmPasswordController;
  final TextEditingController addressController;

  SignupBottomSection({
    super.key,
    required this.nameController,
    required this.emailController,
    required this.phoneNumberController,
    required this.passwordController,
    required this.confirmPasswordController,
    required this.addressController,
  });

  final accountService = AccountService();

  Future<void> signup(BuildContext context) async {
    try {
      await accountService.signup(
        PostRegisterRequest(
          email: emailController.text,
          password: passwordController.text,
          name: nameController.text,
          phone: phoneNumberController.text,
          address: addressController.text,
        ),
      );
      NotifySnackBar.showSuccess(context, "Berhasil Daftar");
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
            height: constraints.maxHeight, // Menggunakan tinggi yang tersedia
            decoration: BoxDecoration(
              color: UIColors.mainWhite,
              borderRadius: BorderRadius.only(
                topLeft: Radius.circular(UISizes.borderRadiusXLg),
                topRight: Radius.circular(UISizes.borderRadiusXLg),
              ),
              boxShadow: [
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
                  // Username
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
                    controller: emailController,
                    obsecureText: false,
                    hint: "Masukkan email anda",
                  ),

                  // Name
                  SizedBox(height: UISizes.sm),
                  Text(
                    "Nama",
                    style: TextStyle(
                      color: Colors.black,
                      fontSize: UISizes.fontSizeSm,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  SizedBox(height: UISizes.sm),
                  LoginSignupTextfield(
                    controller: nameController,
                    obsecureText: false,
                    hint: "Masukkan nama anda",
                  ),

                  // Username
                  SizedBox(height: UISizes.sm),

                  Text(
                    "Nomor Telepon",
                    style: TextStyle(
                      color: Colors.black,
                      fontSize: UISizes.fontSizeSm,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  SizedBox(height: UISizes.sm),
                  LoginSignupTextfield(
                    controller: phoneNumberController,
                    obsecureText: false,
                    hint: "Masukkan nomor telepon anda",
                  ),
                  SizedBox(height: UISizes.sm),
                  Text(
                    "Alamat",
                    style: TextStyle(
                      color: Colors.black,
                      fontSize: UISizes.fontSizeSm,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  SizedBox(height: UISizes.sm),
                  LoginSignupTextfield(
                    controller: addressController,
                    obsecureText: false,
                    hint: "Masukkan alamat anda",
                    maxLines: 3,
                    minLines: 3,
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
                    controller: passwordController,
                    obsecureText: true,
                    hint: "Masukkan password anda",
                  ),

                  // Confirm Password
                  SizedBox(height: UISizes.sm),
                  Text(
                    "Konfirmasi Password",
                    style: TextStyle(
                      color: Colors.black,
                      fontSize: UISizes.fontSizeSm,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  SizedBox(height: UISizes.sm),
                  LoginSignupTextfield(
                    controller: confirmPasswordController,
                    obsecureText: true,
                    hint: "Masukkan konfirmasi password anda",
                  ),

                  // Sign Up Button
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
                      onPressed: () async {
                        await signup(context);
                      },
                      child: Text(
                        "Daftar",
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 20,
                          color: UIColors.mainWhite,
                        ),
                      ),
                    ),
                  ),

                  // Login Text Trigger
                  SizedBox(height: UISizes.xl),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        "Sudah Punya Akun?",
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
                              builder: (context) => LoginScreen(),
                            ),
                          );
                        },
                        child: Text(
                          "Login",
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
