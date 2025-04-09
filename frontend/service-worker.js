self.addEventListener('install', (event) => {
    event.waitUntil(
      caches.open('family-alert-cache').then((cache) => {
        const filesToCache = [
          '/',
          '/index.html',
          '/login.html',
          '/register.html',
          '/styles/login.css',
          '/scripts/socket.js',
          '/manifest.json',
          '/service-worker.js',
          // Daftar file lainnya
        ];
  
        console.log('File yang akan dicache:', filesToCache);
  
        return cache.addAll(filesToCache).catch((err) => {
          console.error('Gagal menambahkan file ke cache:', err);
        });
      })
    );
  });
  