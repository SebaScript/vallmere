# Vallmere - E-commerce Application with ELK Stack

Una aplicación de e-commerce completa desarrollada con **NestJS** (backend), **Angular** (frontend), **PostgreSQL** (base de datos) y **ELK Stack** (Elasticsearch, Logstash, Kibana) para logging y monitoreo.

## 🏗️ Arquitectura

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Angular       │    │    NestJS       │    │   PostgreSQL    │
│   Frontend      │◄──►│    Backend      │◄──►│   Database      │
│   (Port 80)     │    │   (Port 3000)   │    │   (Port 5432)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       
         ▼                       ▼                       
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│    Filebeat     │    │    Logstash     │    │ Elasticsearch   │
│  (Log Shipper)  │───►│ (Log Processor) │───►│  (Log Storage)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                       │
                                ▼                       ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │     Kibana      │◄───┤  ELK Stack for  │
                       │ (Visualization) │    │    Logging      │
                       │  (Port 5601)    │    │ & Monitoring    │
                       └─────────────────┘    └─────────────────┘
```

## 🚀 Inicio Rápido

### Prerrequisitos

- **Docker Desktop** (versión 20.10+)
- **Docker Compose** (versión 2.0+)
- **Git**
- Al menos **8GB de RAM** disponible para Docker
- **4GB de espacio libre** en disco

### 1. Clonar el Repositorio

```bash
git clone <repository-url>
cd vallmere
```

### 2. Configurar Variables de Entorno

```bash
# El archivo .env ya está configurado con valores por defecto
# Puedes modificarlo según tus necesidades
cp .env .env.local  # Opcional: para configuraciones locales
```

### 3. Iniciar la Aplicación Completa

```bash
# Dar permisos de ejecución a los scripts (solo en Linux/macOS)
chmod +x scripts/*.sh

# Iniciar toda la aplicación
./scripts/start.sh

# O manualmente con docker-compose
docker-compose up -d
```

### 4. Verificar que Todo Funciona

Una vez iniciado, verifica que todos los servicios estén funcionando:

- **Frontend**: [http://localhost](http://localhost)
- **Backend API**: [http://localhost:3000](http://localhost:3000)
- **Health Check**: [http://localhost:3000/health](http://localhost:3000/health)
- **Kibana**: [http://localhost:5601](http://localhost:5601)
- **Elasticsearch**: [http://localhost:9200](http://localhost:9200)

## 📊 Configuración de Monitoreo de Logs

### Acceder a Kibana

1. Abre [http://localhost:5601](http://localhost:5601)
2. Ve a **"Analytics" > "Discover"**
3. Crea un **Index Pattern**:
   - Pattern: `vallmere-*`
   - Time field: `@timestamp`
4. ¡Ya puedes ver todos los logs!

### Tipos de Logs Disponibles

| Índice | Descripción | Fuente |
|--------|-------------|---------|
| `vallmere-backend-*` | Logs del backend NestJS | API, base de datos, errores |
| `vallmere-frontend-*` | Logs del frontend Angular | Eventos del cliente |
| `vallmere-nginx-*` | Logs del servidor web | Accesos, errores HTTP |

### Dashboards Recomendados

Crea visualizaciones para:
- **Requests por minuto** (línea temporal)
- **Status codes HTTP** (gráfico de dona)
- **Errores por endpoint** (tabla)
- **Uso de memoria del backend** (gauge)
- **Geolocalización de usuarios** (mapa)

## 🛠️ Comandos Útiles

### Gestión de la Aplicación

```bash
# Iniciar aplicación
./scripts/start.sh

# Detener aplicación
./scripts/stop.sh

# Reiniciar con limpieza completa
./scripts/stop.sh --clean && ./scripts/start.sh

# Ver estado de servicios
docker-compose ps

# Ver logs en tiempo real
docker-compose logs -f [servicio]
```

### Logs por Servicio

```bash
# Ver logs del backend
docker-compose logs -f backend

# Ver logs del frontend/nginx
docker-compose logs -f frontend

# Ver logs de Elasticsearch
docker-compose logs -f elasticsearch

# Ver logs de Logstash
docker-compose logs -f logstash

# Ver logs de todos los servicios
docker-compose logs -f
```

### Gestión de Datos

```bash
# Backup de la base de datos
docker-compose exec postgres pg_dump -U vallmere_user vallmere_db > backup.sql

# Restaurar base de datos
docker-compose exec -T postgres psql -U vallmere_user vallmere_db < backup.sql

# Limpiar logs de Elasticsearch (mantener últimos 7 días)
curl -X DELETE "localhost:9200/vallmere-*-$(date -d '7 days ago' +%Y.%m.%d)"
```

## 🏗️ Desarrollo

### Modo Desarrollo

```bash
# Backend en modo desarrollo
cd backend
npm install
npm run start:dev

# Frontend en modo desarrollo  
cd frontend
npm install
npm run start
```

### Construcción de Imágenes

```bash
# Construir solo el backend
docker-compose build backend

# Construir solo el frontend
docker-compose build frontend

# Construir todas las imágenes
docker-compose build
```

## 🔧 Configuración Avanzada

### Variables de Entorno Importantes

| Variable | Descripción | Valor por Defecto |
|----------|-------------|-------------------|
| `POSTGRES_USER` | Usuario de PostgreSQL | `vallmere_user` |
| `POSTGRES_PASSWORD` | Contraseña de PostgreSQL | `vallmere_password` |
| `POSTGRES_DB` | Nombre de la base de datos | `vallmere_db` |
| `JWT_SECRET` | Secreto para tokens JWT | (cambiar en producción) |
| `NODE_ENV` | Entorno de ejecución | `production` |
| `DB_SYNC` | Sincronización automática de DB | `true` |

### Configuración de Memoria

Para entornos con menos RAM, ajusta en `docker-compose.yml`:

```yaml
elasticsearch:
  environment:
    - "ES_JAVA_OPTS=-Xms512m -Xmx512m"  # Reducir memoria

logstash:
  environment:
    - LS_JAVA_OPTS=-Xmx256m -Xms256m    # Reducir memoria
```

### Configuración de Seguridad

Para producción, cambiar:

1. **JWT Secret**: Generar uno seguro
2. **Contraseñas de base de datos**: Usar contraseñas fuertes
3. **CORS**: Configurar dominios específicos
4. **HTTPS**: Habilitar certificados SSL

## 🚨 Troubleshooting

### Problemas Comunes

#### 1. Error "Port already in use"
```bash
# Verificar qué proceso usa el puerto
lsof -i :80  # o el puerto específico

# Detener servicios conflictivos
sudo systemctl stop apache2  # o nginx local
```

#### 2. Elasticsearch no inicia (memoria insuficiente)
```bash
# Verificar memoria disponible
free -h

# Reducir memoria de ES en docker-compose.yml
ES_JAVA_OPTS=-Xms512m -Xmx512m
```

#### 3. Backend no se conecta a la base de datos
```bash
# Verificar logs del backend
docker-compose logs backend

# Verificar que postgres esté funcionando
docker-compose exec postgres pg_isready -U vallmere_user
```

#### 4. Logstash no procesa logs
```bash
# Verificar configuración de pipeline
docker-compose exec logstash cat /usr/share/logstash/pipeline/main.conf

# Ver logs de Logstash
docker-compose logs logstash
```

### Logs de Debugging

Para habilitar logs más detallados:

```bash
# Backend en modo debug
docker-compose exec backend npm run start:debug

# Ver logs específicos de un contenedor
docker logs -f vallmere-backend
```

## 📈 Monitoreo y Alertas

### Métricas Importantes

1. **Performance del Backend**
   - Tiempo de respuesta promedio
   - Errores 5xx por minuto
   - Uso de memoria y CPU

2. **Frontend/Nginx**
   - Requests por segundo
   - Tiempo de carga de páginas
   - Códigos de estado HTTP

3. **Base de Datos**
   - Conexiones activas
   - Consultas lentas
   - Espacio en disco

### Configurar Alertas en Kibana

1. Ve a **"Stack Management" > "Watcher"** (licencia Gold+)
2. O usa **"Alerting" > "Rules"** para alertas básicas
3. Configura alertas para:
   - Errores > 10 por minuto
   - Tiempo de respuesta > 2 segundos
   - Memoria > 80%

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crea un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🆘 Soporte

Si tienes problemas:

1. Revisa la sección de **Troubleshooting**
2. Verifica los logs: `docker-compose logs [servicio]`
3. Asegúrate de tener suficiente RAM (8GB recomendado)
4. Verifica que Docker Desktop esté funcionando

Para más ayuda, crea un issue en el repositorio con:
- Descripción del problema
- Logs relevantes
- Información del sistema (OS, Docker version)
- Pasos para reproducir el error

---

**¡Feliz desarrollo!** 🚀 