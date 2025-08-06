# Score Online Latam - RociPoints

Sistema de puntos para equipos de trabajo con persistencia en MongoDB.

## 🚀 Características

- **Sistema de Puntos**: Agregar y restar puntos (-5, -3, -1, +1, +3, +5)
- **Autenticación**: Sistema de usuarios con contraseñas
- **Comentarios**: Justificación obligatoria para cambios de puntos
- **Historial**: Seguimiento completo de todos los cambios
- **Estadísticas**: Estadísticas en tiempo real del equipo
- **Efectos Visuales**: Confeti y llamas al agregar/quitar puntos
- **Persistencia**: Datos guardados en MongoDB
- **Tiempo Real**: Todos los usuarios ven los mismos datos

## 🛠️ Instalación

### Prerrequisitos

1. **Node.js** (versión 14 o superior)
2. **MongoDB** (local o Atlas)

### Pasos de Instalación

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Configurar MongoDB:**
   
   **Opción A - MongoDB Local:**
   ```bash
   # Instalar MongoDB localmente
   # O usar Docker:
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

   **Opción B - MongoDB Atlas:**
   - Crear cuenta en [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Crear un cluster gratuito
   - Obtener la URI de conexión

3. **Configurar variables de entorno:**
   
   Crear archivo `.env` en la raíz del proyecto:
   ```env
   # Para MongoDB local
   MONGODB_URI=mongodb://localhost:27017/roci-points
   
   # Para MongoDB Atlas (reemplazar con tu URI)
   # MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/roci-points
   
   PORT=3000
   NODE_ENV=development
   ```

4. **Ejecutar el servidor:**
   ```bash
   # Modo desarrollo (con auto-reload)
   npm run dev
   
   # Modo producción
   npm start
   ```

5. **Acceder a la aplicación:**
   ```
   http://localhost:3000
   ```

## 👥 Usuarios por Defecto

| Usuario | Contraseña | Color |
|---------|------------|-------|
| rocio | rocio123 | 🔴 |
| javiera | javiera123 | 🟣 |
| juan-felipe | juan123 | 🔵 |
| daniel | daniel123 | 🟠 |
| alvaro | alvaro123 | 🟢 |

## 📊 API Endpoints

- `GET /api/members` - Obtener todos los miembros
- `GET /api/history` - Obtener historial de cambios
- `GET /api/settings` - Obtener configuración
- `POST /api/members/:id/points` - Actualizar puntos de un miembro
- `PUT /api/members/reset` - Reiniciar todas las puntuaciones
- `PUT /api/settings` - Actualizar configuración
- `DELETE /api/history` - Limpiar historial

## 🎯 Funcionalidades

### Sistema de Puntos
- Puntos fijos: -5, -3, -1, +1, +3, +5
- Comentarios obligatorios para justificar cambios
- Autenticación de usuarios

### Efectos Visuales
- **Confeti**: Al agregar puntos
- **Llamas**: Al restar puntos
- Efectos más lentos y duraderos

### Estadísticas
- Total de puntos del equipo
- Promedio por miembro
- Líder actual
- Actividad del día
- Mejor racha

### Historial
- Filtrado por tipo (agregar/quitar)
- Información del usuario que asignó puntos
- Comentarios y timestamps

## 🔧 Desarrollo

### Estructura del Proyecto
```
roci-points/
├── server.js          # Servidor Express + MongoDB
├── package.json       # Dependencias
├── index.html         # Interfaz principal
├── styles.css         # Estilos
├── script.js          # Lógica del frontend
└── README.md          # Documentación
```

### Comandos Útiles

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Ejecutar en modo producción
npm start

# Ver logs del servidor
npm start | cat
```

## 🗄️ Base de Datos

### Colecciones MongoDB

**members**
```javascript
{
  id: "rocio",
  name: "Rocío",
  score: 15
}
```

**history**
```javascript
{
  memberId: "rocio",
  memberName: "Rocío",
  points: 3,
  type: "add",
  comment: "Excelente trabajo",
  assignedBy: "Alvaro",
  assignedByColor: "#27ae60",
  timestamp: "2024-01-15T10:30:00Z",
  timeString: "10:30:00"
}
```

**settings**
```javascript
{
  defaultAddPoints: 1,
  defaultSubtractPoints: 1,
  autoSave: true,
  showNotifications: true
}
```

## 🚀 Despliegue

### Heroku
1. Crear cuenta en Heroku
2. Conectar repositorio
3. Configurar variables de entorno
4. Desplegar

### Vercel
1. Conectar repositorio a Vercel
2. Configurar variables de entorno
3. Desplegar

### Docker
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 📝 Licencia

MIT License - Ver archivo LICENSE para más detalles.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue o pull request.

---

**Score Online Latam - RociPoints** 🏆 