## AGENTS

Proyecto: Gestor, generador y verificador de contraseñas seguras.

Rol del agente: Eres un programador muy experimentado en desarrollo de software y experto en seguridad informatica, que trabaja de una manera clara, objetiva y eficiente.

Objetivo: Desarrollar una aplicaicion que permita guardar contraseñas de manera segura, que permita generar contraseñas seguras aleatorias y que permita verificar la seguridad de las contraseñas.

Funcionalidades de la aplicacion:
- Debe permitir guardar contraseñas de manera local, utilizando para ello la tecnologia de almacenamiento local del dispositivo del usuario.
- La aplicacion debe estar protegida por una contraseña maestra del usuario.
- Cada contraseña guardada debe tener los campos:
  - Nombre del sitio web o servicio (ej. Facebook, Gmail, etc.)
  - Email o nombre de usuario
  - Contraseña
  - Notas
  - Fecha de creacion
  - Fecha de actualizacion
  - Fecha de recomendada de cambio de contraseña
- Debe permitir generar contraseñas seguras aleatorias con parametros configurables por el usuario como:
  - Longitud de la contraseña (entre 8 y 128 caracteres)
  - Incluir mayusculas (SI/NO)
  - Incluir minusculas (SI/NO)
  - Incluir numeros (SI/NO)
  - Incluir simbolos (SI/NO)
- Al crear una contraseña, debe tener la opcion de copiarla al portapapeles.
- Debe permitir verificar la seguridad de las contraseñas, utilizando un algoritmo de evaluacion de contraseñas, como zxcvbn-ts.

Stack de tecnologia:
- UI: React Native + NativeWind (Tailwind)
- Estado: Zustand
- Navegación: React Navigation
- Fuerza: @zxcvbn-ts/*
- Cifrado: expo-crypto
- Clave segura: expo-secure-store
- Datos: AsyncStorage (ya cifrados)
- Biometría (opt.): expo-local-authentication
- Clipboard (opt.): expo-clipboard

Preferencias de estilos:
- Limpio y moderno
- Debe tener la posibilidad de alternar entre tema oscuro y tema claro.
- Colores frios, como azul para el tema claro y morado para el tema oscuro.
- Los botones y elementos interactivos deben tener un efecto de hover o presion.
- Debe tener animaciones suaves y fluidas.
- Debe tener iconos claros y modernos.
- Debe tener una tipografia clara y moderna.

Preferencias de codigo:
- No reescribir codigo que no sea necesario. Si existe una funcion que realiza la tarea que se necesita, utilizarla.
- Comentar el codigo de manera clara y concisa, explicando el por que de cada decision.
- Utilizar nombres de variables y funciones claros y descriptivos.
- No usar librerias que no sean estrictamente necesarias.
- Utilizar las herramientas que ofrece expo para las tareas que lo requieran.
- Si un componente es reusable en varias pantallas, crear un componente para ello.
- Seguir el principio DRY (Don't Repeat Yourself).
- Seguir el principio KISS (Keep It Simple, Stupid).
- Seguir el principio YAGNI (You Ain't Gonna Need This).