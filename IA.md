# IA Local para Blitz Scan (Ollama + llama3)

Este proyecto utiliza una IA local para generar reportes de seguridad usando el modelo **llama3** a través de [Ollama](https://ollama.com/). Sigue estos pasos para instalar y usar la IA en tu máquina.

---

## 1. Instalar Ollama

### Windows, Mac, Linux
- Descarga el instalador desde: [https://ollama.com/download](https://ollama.com/download)
- Sigue las instrucciones del instalador para tu sistema operativo.

**O desde terminal (Mac/Linux):**
```sh
curl -fsSL https://ollama.com/install.sh | sh
```

---

## 2. Iniciar el servidor Ollama

En terminal:
```sh
ollama serve
```
Esto deja corriendo el servidor local en `http://localhost:11434`.

---

## 3. Descargar el modelo llama3

En terminal:
```sh
ollama pull llama3
```
Esto descargará el modelo y lo dejará listo para usar.

---

## 4. (Opcional) Probar que funciona

Puedes probar con:
```sh
ollama run llama3
```
Y escribir un prompt para ver que responde.

---

## 5. Dejar corriendo el servidor

Para que la app Blitz Scan se conecte, asegúrate de que el servidor Ollama esté corriendo:
```sh
ollama serve
```
(o simplemente abre la app Ollama si usas la versión de escritorio).

---

## 6. Notas importantes
- El backend de Blitz Scan se conecta a `http://localhost:11434` por defecto.
- Si cambias el puerto o la IP, actualiza la configuración en el backend.
- El modelo llama3 es suficiente para reportes de seguridad, pero puedes probar otros modelos compatibles con Ollama si lo deseas.

---

## 7. Resumen de comandos

```sh
# Instalar Ollama (descarga desde la web o usa el script)
curl -fsSL https://ollama.com/install.sh | sh

# Iniciar el servidor Ollama
ollama serve

# Descargar el modelo llama3
ollama pull llama3
```

---

¡Listo! Ahora puedes usar la IA localmente para generar reportes de seguridad en Blitz Scan 🚀 