import 'package:dabskoi/helper/notify_snack_bar.dart';
import 'package:dabskoi/screen/auth/login_signup_screen.dart';
import 'package:dabskoi/screen/home/main_tab.dart';
import 'package:dabskoi/screen/splash/splash_screen.dart';
import 'package:flutter/material.dart';
import 'core/navigation.dart';
import 'core/dio_client.dart';

final GlobalKey<ScaffoldMessengerState> rootScaffoldMessengerKey =
    GlobalKey<ScaffoldMessengerState>();

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  NotifySnackBar.attachGlobalKey(rootScaffoldMessengerKey);
  DioClient.init();
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      navigatorKey: rootNavigatorKey,
      scaffoldMessengerKey: rootScaffoldMessengerKey,

      initialRoute: '/splash',
      routes: {
        '/splash': (_) => const SplashScreen(),
        '/login': (_) => const LoginSignUpScreen(),
        '/home': (_) => const MainTab(),
      },
    );
  }
}
