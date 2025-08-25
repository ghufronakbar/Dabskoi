class Account {
  final String id;
  final String email;
  final String name;
  String? phone;
  String? address;
  String? picture;
  final String accessToken;

  Account({
    required this.id,
    required this.email,
    required this.name,
    this.phone,
    this.address,
    this.picture,
    required this.accessToken,
  });

  factory Account.fromJson(Map<String, dynamic> json) {
    return Account(
      id: json['id'],
      email: json['email'],
      name: json['name'],
      phone: json['phone'],
      address: json['address'],
      picture: json['picture'],
      accessToken: json['accessToken'],
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'email': email,
    'name': name,
    'phone': phone,
    'address': address,
    'picture': picture,
    'accessToken': accessToken,
  };
}
