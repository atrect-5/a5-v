# Gestor de contraseñas

Aplicación móvil para guardar credenciales en una bóveda local protegida por contraseña maestra. También permite generar contraseñas aleatorias, evaluar su fortaleza y revisar el estado de seguridad de las credenciales guardadas.

## Funcionalidades

### Bóveda de credenciales

- Guarda las credenciales en el dispositivo; no requiere una cuenta ni sincronización con un servidor.
- Protege el acceso con una contraseña maestra de al menos 8 caracteres.
- Cifra las credenciales antes de guardarlas en el almacenamiento local.
- Permite crear, consultar, editar y eliminar registros con servicio, usuario o email, contraseña, notas y fechas de creación, actualización y cambio recomendado.
- Organiza los registros por categoría: general, social, email, trabajo y finanzas.
- Incluye búsqueda por servicio, usuario o notas y filtros por categoría.
- Permite bloquear la bóveda y volver a solicitar autenticación.

### Generador de contraseñas

- Genera contraseñas de entre 8 y 128 caracteres.
- Permite elegir si incluir mayúsculas, minúsculas, números y símbolos.
- Permite regenerar y copiar la contraseña al portapapeles.
- Evalúa la contraseña generada y permite guardarla directamente en la bóveda.

### Auditoría de seguridad

- Evalúa contraseñas con `zxcvbn-ts` y muestra nivel, sugerencias y una estimación del tiempo de descifrado.
- Ofrece un verificador interactivo para evaluar una contraseña sin guardarla.
- Resume las contraseñas débiles, reutilizadas y que requieren renovación, y muestra las credenciales débiles o vencidas detectadas en la bóveda.

### Ajustes

- Alterna entre tema claro (azul) y oscuro (morado), y conserva la preferencia en el dispositivo.
- Permite cambiar la contraseña maestra y volver a cifrar la bóveda.
- Ofrece desbloqueo biométrico cuando el dispositivo tiene biometría configurada y disponible.

## Tecnologías

- **Aplicación móvil:** React Native con Expo y TypeScript.
- **Interfaz y estilos:** NativeWind y componentes de React Native.
- **Navegación:** React Navigation.
- **Estado:** Zustand.
- **Persistencia local:** AsyncStorage para la bóveda cifrada y SecureStore para datos de autenticación.
- **Criptografía y autenticación del dispositivo:** `expo-crypto`, `crypto-js`, `expo-secure-store` y `expo-local-authentication`.
- **Fortaleza de contraseñas:** `@zxcvbn-ts/core` y paquetes de idioma.
- **Portapapeles:** `expo-clipboard`.

## Requisitos

- Node.js y npm.
- Expo Go en un dispositivo compatible, o un emulador/simulador configurado para React Native.
- Para compilar o ejecutar en un emulador, instala y configura las herramientas nativas de la plataforma correspondiente.

## Instalación y ejecución

1. Clona el repositorio y entra en la carpeta del proyecto:

   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd <CARPETA_DEL_PROYECTO>
   ```

2. Instala las dependencias:

   ```bash
   npm install
   ```

3. Inicia Expo:

   ```bash
   npx expo start
   ```

4. Abre la aplicación:
   - **Dispositivo físico:** escanea el código QR con Expo Go. El ordenador y el dispositivo deben poder comunicarse por la red.
   - **Emulador Android:** inicia el emulador y pulsa `a` en la terminal de Expo, o ejecuta `npm run android`.
   - **Simulador iOS:** en macOS con Xcode configurado, pulsa `i` o ejecuta `npm run ios`.
   - **Web:** ejecuta `npm run web` para iniciar la versión web de Expo; la disponibilidad de funciones nativas puede variar.

Los comandos `npm run start`, `npm run android`, `npm run ios` y `npm run web` están definidos en `package.json`.

## Guía de prueba manual

La configuración actual del proyecto no define un comando de pruebas automatizadas. Puedes comprobar los flujos principales manualmente:

1. **Configurar el acceso:** en una instalación nueva, crea una contraseña maestra de al menos 8 caracteres y confirma que la bóveda se abre. Cierra y vuelve a abrir la app para comprobar que solicita la clave configurada.
2. **Crear una credencial:** en **Bóveda**, añade un servicio, usuario, contraseña, notas y categoría. Comprueba que aparece en la lista.
3. **Buscar y organizar:** busca el registro por servicio o usuario y prueba los filtros de categoría.
4. **Editar y eliminar:** modifica un registro y confirma que los cambios se conservan. Si pruebas la eliminación, verifica la confirmación antes de borrarlo.
5. **Generar una contraseña:** en **Generador**, cambia la longitud entre 8 y 128 y activa o desactiva los tipos de caracteres. Regenera, copia y pega la contraseña en un campo de prueba. Comprueba también la opción para guardarla en la bóveda.
6. **Revisar la auditoría:** en **Auditoría**, prueba el evaluador en tiempo real y confirma que se muestran el nivel de seguridad y las recomendaciones. Con credenciales guardadas, revisa los indicadores de contraseñas débiles, reutilizadas o pendientes de cambio.
7. **Probar ajustes:** cambia entre tema claro y oscuro y reinicia la app para comprobar que la preferencia persiste. Si el dispositivo tiene biometría configurada, activa y prueba el desbloqueo biométrico.
8. **Cambiar la contraseña maestra:** desde **Ajustes**, cambia la clave, bloquea o reinicia la app, desbloquea con la nueva y verifica que las credenciales guardadas siguen disponibles.

> **Nota:** la disponibilidad de biometría depende del hardware, la configuración del dispositivo y el entorno de ejecución. En Expo Go o en web, algunas funciones nativas pueden tener limitaciones.

## Consideraciones de seguridad

- Los datos de la bóveda se almacenan localmente y cifrados; la app no sincroniza credenciales entre dispositivos.
- La contraseña maestra no se puede recuperar desde la aplicación. Si la olvidas, podrías perder el acceso a la bóveda.
- Usa una contraseña maestra larga y única. Evita guardar credenciales reales en dispositivos compartidos o de prueba.
- La evaluación de fortaleza es una guía y no sustituye las prácticas de seguridad del servicio donde uses cada contraseña.
- Antes de utilizar la aplicación para guardar información sensible en producción, revisa y valida de forma independiente su implementación criptográfica y el manejo de claves.

## Estructura del proyecto

```text
src/
├── components/   # Componentes reutilizables
├── navigation/   # Navegación principal
├── screens/      # Bóveda, generador, auditoría, acceso y ajustes
├── services/     # Cifrado, almacenamiento, generación y evaluación
├── store/        # Estado global de la bóveda y el tema
├── theme/        # Paletas de colores
└── types/        # Tipos compartidos
```
