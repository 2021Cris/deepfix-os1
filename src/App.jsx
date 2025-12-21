<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="https://lucide.dev/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>DeepFix OS 1 - Terminal Pericial SC-25</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;900&display=swap');
      body { 
        font-family: 'Inter', sans-serif; 
        background-color: #0f172a; 
        margin: 0; 
        color: #f8fafc;
      }
      #root { min-height: 100vh; }
      
      /* Estilos para impresión del certificado */
      @media print {
        body * { visibility: hidden; }
        #printable-certificate, #printable-certificate * { visibility: visible; }
        #printable-certificate {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          background: white !important;
          color: black !important;
        }
      }

      input::-webkit-outer-spin-button,
      input::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/App.jsx"></script>
  </body>
</html>
