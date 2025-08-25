// TODO: change to your ip address
const String ip = '192.168.1.55';
const String apiBaseUrl = String.fromEnvironment(
  'API_URL',
  defaultValue: 'http://$ip:3001',
);
