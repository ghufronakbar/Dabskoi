import 'dart:async';

import 'package:dabskoi/helper/notify_snack_bar.dart';
import 'package:dabskoi/helper/sizes.dart';
import 'package:dabskoi/screen/home/tab/koi/koi_detail_screen.dart';
import 'package:dabskoi/services/koi_service.dart';
import 'package:flutter/material.dart';
import 'package:dabskoi/helper/colors.dart';
import 'package:dabskoi/services/chat_service.dart';
import 'package:dabskoi/models/chat_responses.dart';
import 'package:dabskoi/models/chat_requests.dart';
import 'package:dabskoi/services/realtime_service.dart';
import 'package:dabskoi/services/image_upload_service.dart';
import 'package:image_picker/image_picker.dart';

class ChatScreen extends StatelessWidget {
  const ChatScreen({super.key});
  @override
  Widget build(BuildContext context) => const MessagesScreen();
}

class MessagesScreen extends StatefulWidget {
  const MessagesScreen({super.key});
  @override
  State<MessagesScreen> createState() => _MessagesScreenState();
}

class _MessagesScreenState extends State<MessagesScreen> {
  final Color _primary = const Color(0xFFBB0000);

  final _search = TextEditingController();
  final _composer = TextEditingController();
  final _listCtrl = ScrollController();

  StreamSubscription? _chatNewSub;

  bool _loading = true;
  bool _sending = false; // kirim text / image
  bool _uploadingImage = false; // indikator tombol image
  String _error = '';

  ChatResponse? _chat;
  List<ChatMessage> _filtered = [];

  static const String kImagePlaceholder =
      'https://via.placeholder.com/600x400?text=No+Image';

  @override
  void initState() {
    super.initState();
    _fetch();
    RealtimeService.I.connect();
    _chatNewSub = RealtimeService.I.chatNew$.listen((_) async {
      await _fetch();
      _scrollToBottom();
    });
  }

  @override
  void dispose() {
    _search.dispose();
    _composer.dispose();
    _listCtrl.dispose();
    _chatNewSub?.cancel();
    super.dispose();
  }

  Future<void> _fetch() async {
    setState(() {
      _loading = true;
      _error = '';
    });
    try {
      final res = await ChatService().getChat();

      setState(() {
        _chat = res;
        _filtered = res.messages;
        _loading = false;
      });
      WidgetsBinding.instance.addPostFrameCallback(
        (_) => _scrollToBottom(animated: false),
      );
    } catch (e) {
      setState(() {
        _error = 'Gagal memuat percakapan: $e';
        _loading = false;
      });
    }
  }

  void _onSearch(String q) {
    if (_chat == null) return;
    final s = q.trim().toLowerCase();
    if (s.isEmpty) {
      setState(() => _filtered = _chat!.messages);
      WidgetsBinding.instance.addPostFrameCallback((_) => _scrollToBottom());
      return;
    }
    setState(() {
      _filtered = _chat!.messages.where((m) {
        final content = m.chat.content.toLowerCase();
        final prodName = m.chat.product?.name.toLowerCase() ?? '';
        final type = m.type.name.toLowerCase();
        return content.contains(s) || prodName.contains(s) || type.contains(s);
      }).toList();
    });
  }

  Future<void> _sendText() async {
    final text = _composer.text.trim();
    if (text.isEmpty || _sending) return;

    setState(() => _sending = true);
    try {
      final ok = await ChatService().sendChat(
        SendChatRequest(content: text, type: "TEXT"),
      );
      if (ok) {
        _composer.clear();
        FocusScope.of(context).unfocus();
        await _fetch();
        _scrollToBottom();
      } else {
        NotifySnackBar.showError(context, 'Gagal mengirim pesan');
      }
    } catch (e) {
      NotifySnackBar.showError(context, e);
    } finally {
      if (mounted) setState(() => _sending = false);
    }
  }

  // NEW: bottom sheet pilih kamera/galeri
  Future<void> _onTapPickImage() async {
    if (_sending || _uploadingImage) return;
    showModalBottomSheet(
      context: context,
      showDragHandle: true,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      builder: (_) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: const Icon(Icons.photo_outlined),
              title: const Text('Galeri'),
              onTap: () {
                Navigator.pop(context);
                _pickAndSend(ImageSource.gallery);
              },
            ),
            ListTile(
              leading: const Icon(Icons.photo_camera_outlined),
              title: const Text('Kamera'),
              onTap: () {
                Navigator.pop(context);
                _pickAndSend(ImageSource.camera);
              },
            ),
            ListTile(
              leading: const Icon(Icons.close),
              title: const Text('Batal'),
              onTap: () => Navigator.pop(context),
            ),
          ],
        ),
      ),
    );
  }

  // NEW: pilih gambar -> upload -> kirim chat IMAGE
  Future<void> _pickAndSend(ImageSource source) async {
    try {
      final picker = ImagePicker();
      final XFile? xfile = await picker.pickImage(
        source: source,
        imageQuality: 85,
      );
      if (xfile == null) return;

      setState(() {
        _uploadingImage = true;
        _sending = true;
      });

      final uploader = ImageUploadService();
      final url = await uploader.uploadXFile(xfile);

      final ok = await ChatService().sendChat(
        SendChatRequest(content: url, type: "IMAGE"),
      );

      if (ok) {
        await _fetch();
        _scrollToBottom();
      } else {
        NotifySnackBar.showError(context, 'Gagal mengirim gambar');
      }
    } catch (e) {
      NotifySnackBar.showError(context, 'Gagal upload/kirim gambar: $e');
    } finally {
      if (mounted) {
        setState(() {
          _uploadingImage = false;
          _sending = false;
        });
      }
    }
  }

  void _scrollToBottom({bool animated = true}) {
    if (!_listCtrl.hasClients) return;
    final max = _listCtrl.position.maxScrollExtent;
    if (animated) {
      _listCtrl.animateTo(
        max,
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeOut,
      );
    } else {
      _listCtrl.jumpTo(max);
    }
  }

  String _fmtTime(DateTime dt) {
    final l = dt.toLocal().toString().split(':');
    return '${l[0]}:${l[1]}';
  }

  String _fmtPrice(num v) => 'Rp ${v.toStringAsFixed(0)}';

  Widget _chip(String text) => Container(
    margin: const EdgeInsets.only(bottom: 6),
    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
    decoration: BoxDecoration(
      color: Colors.black12,
      borderRadius: BorderRadius.circular(999),
    ),
    child: Text(text, style: const TextStyle(fontSize: 11)),
  );

  Widget _buildMessage(ChatMessage m) {
    final isMe = m.role == ChatRole.USER;
    final bubbleColor = isMe ? _primary : const Color(0xFFEDEDED);
    final textColor = isMe ? Colors.white : Colors.black87;

    Widget? badge() {
      switch (m.type) {
        case ChatMessageType.IMAGE:
          return _chip('Gambar');
        case ChatMessageType.REFERENCE_SELL:
          return _chip('Referensi Jual');
        case ChatMessageType.REFERENCE_NEGO:
          return _chip('Referensi Nego');
        case ChatMessageType.REFERENCE_AUCTION:
          return _chip('Referensi Lelang');
        case ChatMessageType.NEGO_REQUEST:
          return _chip('Permintaan Nego');
        case ChatMessageType.NEGO_RESPONSE_ACCEPT:
          return _chip('Nego Diterima');
        case ChatMessageType.NEGO_RESPONSE_REJECT:
          return _chip('Nego Ditolak');
        case ChatMessageType.AUCTION_RESPONSE_ACCEPT:
          return _chip('Lelang Diterima');
        case ChatMessageType.AUCTION_RESPONSE_REJECT:
          return _chip('Lelang Ditolak');
        case ChatMessageType.TEXT:
          return null;
      }
    }

    Widget content() {
      final p = m.chat.product;
      final productCard = (p != null)
          ? Container(
              margin: const EdgeInsets.only(bottom: 8),
              decoration: BoxDecoration(
                color: isMe ? Colors.white.withOpacity(0.15) : Colors.white,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(
                  color: isMe ? Colors.white24 : Colors.black12,
                ),
              ),
              child: InkWell(
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => KoiDetailScreen(
                        id: p.id,
                        type: p.type == ChatProductType.NEGO
                            ? KoiFetchType.negos
                            : p.type == ChatProductType.AUCTION
                            ? KoiFetchType.auctions
                            : KoiFetchType.sells,
                      ),
                    ),
                  );
                },
                child: Row(
                  children: [
                    ClipRRect(
                      borderRadius: const BorderRadius.only(
                        topLeft: Radius.circular(8),
                        bottomLeft: Radius.circular(8),
                      ),
                      child: Image.network(
                        (p.images.isNotEmpty
                            ? p.images.first
                            : kImagePlaceholder),
                        width: 72,
                        height: 72,
                        fit: BoxFit.cover,
                        errorBuilder: (_, __, ___) => Container(
                          width: 72,
                          height: 72,
                          color: Colors.black12,
                          child: const Icon(Icons.broken_image),
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Padding(
                        padding: const EdgeInsets.symmetric(
                          vertical: 8,
                          horizontal: 4,
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              p.name,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: TextStyle(
                                color: isMe ? Colors.white : Colors.black87,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              '${p.type} • ${p.gender}',
                              style: TextStyle(
                                fontSize: 12,
                                color: isMe
                                    ? Colors.white70
                                    : Colors.black.withOpacity(0.6),
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              _fmtPrice(p.price),
                              style: TextStyle(
                                fontWeight: FontWeight.w700,
                                color: isMe ? Colors.white : _primary,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                  ],
                ),
              ),
            )
          : const SizedBox.shrink();

      final main = (m.type == ChatMessageType.IMAGE)
          ? ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: Image.network(
                m.chat.content.isEmpty ? kImagePlaceholder : m.chat.content,
                fit: BoxFit.cover,
                errorBuilder: (_, __, ___) => const SizedBox(
                  height: 160,
                  child: Center(child: Icon(Icons.broken_image)),
                ),
              ),
            )
          : Text(m.chat.content, style: TextStyle(color: textColor));

      return Column(
        crossAxisAlignment: isMe
            ? CrossAxisAlignment.end
            : CrossAxisAlignment.start,
        children: [
          if (badge() != null) badge()!,
          if (p != null) productCard,
          main,
          const SizedBox(height: 6),
          Text(
            _fmtTime(m.createdAt),
            style: TextStyle(
              fontSize: 11,
              color: isMe ? Colors.white70 : Colors.black54,
            ),
          ),
        ],
      );
    }

    return Align(
      alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 320),
        child: Container(
          margin: const EdgeInsets.symmetric(vertical: 6, horizontal: 12),
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: bubbleColor,
            borderRadius: BorderRadius.only(
              topLeft: const Radius.circular(12),
              topRight: const Radius.circular(12),
              bottomLeft: isMe
                  ? const Radius.circular(12)
                  : const Radius.circular(2),
              bottomRight: isMe
                  ? const Radius.circular(2)
                  : const Radius.circular(12),
            ),
          ),
          child: content(),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final imageBtn = IconButton(
      tooltip: 'Kirim gambar',
      icon: _uploadingImage
          ? const SizedBox(
              width: 20,
              height: 20,
              child: CircularProgressIndicator(strokeWidth: 2),
            )
          : const Icon(Icons.image_outlined),
      color: _primary,
      onPressed: (_sending || _uploadingImage) ? null : _onTapPickImage,
    );

    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Percakapan',
          style: TextStyle(fontWeight: FontWeight.bold, fontSize: UISizes.md),
          overflow: TextOverflow.ellipsis,
        ),
        backgroundColor: UIColors.mainWhite,
        actions: [
          IconButton(icon: const Icon(Icons.refresh), onPressed: _fetch),
        ],
      ),
      body: Column(
        children: [
          // search
          Padding(
            padding: const EdgeInsets.all(12.0),
            child: TextField(
              controller: _search,
              onChanged: _onSearch,
              decoration: InputDecoration(
                hintText: 'Cari di percakapan…',
                prefixIcon: const Icon(Icons.search),
                filled: true,
                fillColor: Colors.grey[100],
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                contentPadding: const EdgeInsets.symmetric(
                  horizontal: 12,
                  vertical: 10,
                ),
              ),
            ),
          ),
          if (_error.isNotEmpty)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 12),
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.red[50],
                  border: Border.all(color: Colors.red),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(_error, style: const TextStyle(color: Colors.red)),
              ),
            ),
          if (_loading) const LinearProgressIndicator(),
          Expanded(
            child: (_chat == null && !_loading)
                ? const Center(child: Text('Belum ada pesan'))
                : ListView.builder(
                    controller: _listCtrl,
                    padding: const EdgeInsets.only(bottom: 12),
                    itemCount: _filtered.length,
                    itemBuilder: (_, i) => _buildMessage(_filtered[i]),
                  ),
          ),
          // composer
          Padding(
            padding: const EdgeInsets.fromLTRB(12, 0, 12, 12),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _composer,
                    textInputAction: TextInputAction.send,
                    onSubmitted: (_) => _sendText(),
                    decoration: InputDecoration(
                      hintText: 'Tulis pesan…',
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      contentPadding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 10,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                // NEW: tombol picker gambar (di kiri tombol kirim)
                imageBtn,
                const SizedBox(width: 4),
                IconButton(
                  icon: _sending
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : Icon(Icons.send, color: _primary),
                  onPressed: _sending ? null : _sendText,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
