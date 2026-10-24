# Gemelo Digital de Hogares Rurales de Sudamérica

Sistema integral de simulación basada en agentes (ABM), microsimulación econométrica, aprendizaje automático y visualización espacial 3D para la formulación, comparación y evaluación de políticas de transferencias monetarias y resiliencia ante choques climáticos en los 12 países soberanos de Sudamérica.

---

## 1. Alcance Territorial y Cobertura Oficial

El sistema cubre integralmente los 12 países soberanos de Sudamérica y el territorio de Guayana Francesa:

| Código ISO | País / Territorio | Instituto Estadístico Oficial | Encuesta de Hogares Principal |
| :--- | :--- | :--- | :--- |
| **ARG** | Argentina | INDEC | Encuesta Permanente de Hogares (EPH) |
| **BOL** | Bolivia | INE Bolivia | Encuesta de Hogares (EH) |
| **BRA** | Brasil | IBGE | PNAD Contínua |
| **CHL** | Chile | INE / MDSF | Encuesta CASEN |
| **COL** | Colombia | DANE | Gran Encuesta Integrada de Hogares (GEIH) |
| **ECU** | Ecuador | INEC | ENEMDU |
| **GUY** | Guyana | Bureau of Statistics | Guyana Living Conditions Survey |
| **PRY** | Paraguay | INE Paraguay | EPHC Continua |
| **PER** | Perú | INEI | Encuesta Nacional de Hogares (ENAHO) |
| **SUR** | Surinam | ABS | Household Budget Survey (HBS) |
| **URY** | Uruguay | INE Uruguay | Encuesta Continua de Hogares (ECH) |
| **VEN** | Venezuela | INE / UCAB | Proyecto ENCOVI |
| **GUF** | Guayana Francesa | INSEE | Filosofi Guyane |

Fuentes climáticas satelitales integradas:
- **CHIRPS v2.0**: Estimación de precipitación satelital e índice estandarizado de precipitación (SPI) a 0.05° de resolución.
- **ERA5 / ECMWF**: Reanálisis de temperatura horaria y anomalías de heladas en alta montaña.

---

## 2. Metodología CRISP-DM Integrada

1. **Comprensión del Negocio (Business Understanding)**: Formulación de problemas públicos rurales, árbol de objetivos de reducción de pobreza y restricciones fiscales anuales.
2. **Comprensión de los Datos (Data Understanding)**: Catálogo exhaustivo de fuentes oficiales con metadatos, licencias, calidad y EDA multidimensional con factores de ponderación.
3. **Preparación de Datos (Data Preparation)**: Imputación, winsorización, normalización a Paridad de Poder Adquisitivo (USD PPP) y aislamiento estricto de particiones de entrenamiento para evitar fuga de información (*zero leakage*).
4. **Modelado (Modeling)**: Simulación de agentes (Mesa), modelos predictivos (Gradient Boosting, Random Forest, Ridge) y optimización bayesiana TPE en Optuna.
5. **Evaluación (Evaluation)**: Validación estadística formal (Prueba t pareada, McNemar, DeLong Z-test, bondad de ajuste Hosmer-Lemeshow y corrección FDR de Benjamini-Hochberg).
6. **Despliegue y Seguimiento (Deployment & Monitoring)**: Modelos registrados en MLflow, WebSockets reactivos, asistente LangChain con RAG y reportes reproducibles.

---

## 3. Formulación Econométrica y Científica

### A. Índices de Pobreza Foster-Greer-Thorbecke (FGT)

Para una línea de pobreza $z$ e ingresos de consumo per cápita $y_i$ con factores de expansión $w_i$:

$$P_\alpha = \frac{1}{\sum_{i=1}^N w_i} \sum_{i: y_i < z} w_i \left( \frac{z - y_i}{z} \right)^\alpha$$

- **$\alpha = 0$ (Incidencia / Headcount Ratio $P_0$)**: Porcentaje de la población rural viviendo bajo la línea de pobreza.
- **$\alpha = 1$ (Brecha de Pobreza $P_1$)**: Déficit promedio de ingresos necesario para situar a los pobres exactamente en la línea de pobreza.
- **$\alpha = 2$ (Severidad de Pobreza $P_2$)**: Cuadrado del déficit normalizado; sensible a la distribución y desigualdad interna entre los más pobres.

### B. Coeficiente de Gini Ponderado

Calculado mediante la integración trapezoidal de la Curva de Lorenz ordenada por consumo per cápita ascendente:

$$G = 1 - \frac{\sum_{i=1}^N w_i (S_{i-1} + S_i)}{\sum_{i=1}^N w_i \cdot S_N}$$

### C. Conservación Estricta de Presupuestos Fiscales

El costo fiscal total anual se verifica mediante la identidad contable cerrada:

$$\text{Costo Fiscal} = \sum_{h \in \text{Beneficiarios}} w_h \cdot \left[ \text{Transferencia}_h \cdot (1 + \text{CostoAdmin}) \right] \cdot \text{Meses}$$

---

## 4. Arquitectura de Software del Monorepo

```
.
├── backend/                  # FastAPI REST API & WebSocket Streaming
│   ├── main.py              # Enrutador principal y websockets
│   ├── config.py            # Configuración tipada con Pydantic
│   └── tasks/worker.py      # Tareas asíncronas de Celery
├── engine/                   # Motor Científico ABM independiente
│   └── abm_engine.py        # Modelo Mesa de agentes y microsimulación
├── migrations/               # Esquemas SQL PostGIS y pgvector
│   └── init.sql             # Tablas, índices vectoriales y geodésicos
├── src/                      # Frontend React 19 + TypeScript + Vite + Tailwind
│   ├── components/          # Componentes del producto (3D, CRISP-DM, EDA, etc.)
│   ├── data/                # Catálogo de países y generador sintético calibrado
│   ├── engine/              # Motor econométrico y ML en TypeScript
│   └── types/               # Contratos e interfaces tipadas
├── tests/                    # Pruebas automatizadas (FGT, fugas, API)
│   ├── test_engine.py
│   └── test_api.py
├── docker-compose.yml        # Orquestación de Postgres, Redis, MinIO, MLflow
├── Dockerfile.api
├── Dockerfile.worker
└── requirements.txt
```

---

## 5. Instrucciones de Ejecución y Pruebas

### Ejecución Local con Docker Compose

```bash
# 1. Iniciar toda la infraestructura (PostGIS, Redis, MinIO, MLflow, API, Worker, Langflow)
docker-compose up -d --build

# 2. Verificar estado de los contenedores
docker-compose ps

# 3. Comprobar healthcheck de la API
curl http://localhost:8000/health
```

### Ejecución de Pruebas Automatizadas

```bash
# Ejecutar suite de pruebas unitarias y de integración
pytest -v tests/test_engine.py tests/test_api.py
```

### Ejecución del Frontend de Desarrollo

```bash
npm run dev
```
La aplicación web se ejecutará en `http://localhost:3000` con el mapa 3D interactivo Three.js, el laboratorio de políticas públicas y el asistente LangChain.
