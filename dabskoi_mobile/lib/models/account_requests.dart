class PostLoginRequest {
  final String email;
  final String password;

  PostLoginRequest({required this.email, required this.password});

  Map<String, dynamic> toJson() => {'email': email, 'password': password};
}

class PostRegisterRequest {
  final String email;
  final String password;
  final String name;
  final String phone;
  final String address;

  PostRegisterRequest({
    required this.email,
    required this.password,
    required this.name,
    required this.phone,
    required this.address,
  });

  Map<String, dynamic> toJson() => {
    'email': email,
    'password': password,
    'name': name,
    'phone': phone,
    'address': address,
  };
}

class UpdateProfileRequest {
  final String email;
  final String name;
  final String phone;
  final String address;
  final String? picture;

  UpdateProfileRequest({
    required this.email,
    required this.name,
    required this.phone,
    required this.address,
    this.picture,
  });

  Map<String, dynamic> toJson() => {
    'email': email,
    'name': name,
    'phone': phone,
    'address': address,
    'picture': picture,
  };
}
