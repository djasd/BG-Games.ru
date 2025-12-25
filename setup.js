// setup.js
const http = require('http');
const WebSocket = require('ws');

console.log('🚀 Запуск серверов для Яндекс.Музыка...');

// HTTP сервер
const httpServer = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ 
    status: 'running', 
    service: 'Yandex Music Helper',
    timestamp: new Date().toISOString()
  }));
});

// WebSocket сервер
const wss = new WebSocket.Server({ server: httpServer });

wss.on('connection', (ws) => {
  console.log('🔗 Новое WebSocket соединение');
  
  ws.on('message', (message) => {
    console.log('📨 Получено:', message.toString());
    ws.send(`Echo: ${message}`);
  });
  
  ws.on('close', () => {
    console.log('🔒 Соединение закрыто');
  });
});

// Запуск на порту 3002
httpServer.listen(3002, () => {
  console.log('✅ HTTP сервер запущен на порту 3002');
  console.log('✅ WebSocket сервер запущен на порту 3002');
  console.log('🔗 Подключитесь к ws://localhost:3002');
});

// Подключение к отладке Яндекс.Музыка
const CDP = require('chrome-remote-interface');

async function connectToYandexMusic() {
  try {
    console.log('🔌 Подключаемся к Яндекс.Музыка...');
    
    const client = await CDP({
      host: 'localhost',
      port: 9222
    });
    
    console.log('✅ Успешное подключение к Chrome DevTools Protocol');
    
    const { Network, Page } = client;
    
    await Network.enable();
    await Page.enable();
    
    // Пример: отслеживание загрузки страниц
    Network.requestWillBeSent((params) => {
      console.log('🌐 Запрос:', params.request.url.substring(0, 100));
    });
    
    console.log('🎵 Готово! Яндекс.Музыка под контролем.');
    
  } catch (error) {
    console.error('❌ Ошибка подключения:', error.message);
    console.log('⚠️ Убедитесь, что Яндекс.Музыка запущена с параметром --remote-debugging-port=9222');
  }
}

// Подключаемся через 5 секунд
setTimeout(connectToYandexMusic, 5000);

// Обработка завершения
process.on('SIGINT', () => {
  console.log('\n🛑 Завершение работы...');
  httpServer.close();
  process.exit(0);
});
