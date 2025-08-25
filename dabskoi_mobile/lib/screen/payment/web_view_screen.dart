import 'package:flutter/material.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';

class WebViewScreen extends StatefulWidget {
  final String directUrl;

  const WebViewScreen({super.key, required this.directUrl});

  @override
  WebViewScreenState createState() => WebViewScreenState();
}

class WebViewScreenState extends State<WebViewScreen> {
  InAppWebViewController? webViewController;
  bool _eventHandled = false;

  void onEventChange() {
    Navigator.pop(context, "SHOULD_REFRESH");
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: InAppWebView(
        initialUrlRequest: URLRequest(url: WebUri(widget.directUrl)),
        initialSettings: InAppWebViewSettings(
          javaScriptEnabled: true,
          useShouldOverrideUrlLoading: true,
        ),
        onWebViewCreated: (controller) {
          webViewController = controller;
        },
        onLoadStart: (controller, url) {
          if (url == null) return;
          if (!_eventHandled &&
              (url.toString().contains("example") ||
                  url.toString().contains("vercel"))) {
            _eventHandled = true;
            onEventChange();
          }
        },
        onLoadStop: (controller, url) async {
          // Do something if needed
        },
        onReceivedError: (controller, request, error) {
          // Optional: handle error
        },
        onProgressChanged: (controller, progress) {
          // Optional: show progress bar
        },
        shouldOverrideUrlLoading: (controller, navigationAction) async {
          final uri = navigationAction.request.url;
          if (uri != null &&
              !_eventHandled &&
              (uri.toString().contains("example") ||
                  uri.toString().contains("vercel"))) {
            _eventHandled = true;
            onEventChange();
          }
          return NavigationActionPolicy.ALLOW;
        },
      ),
    );
  }
}
