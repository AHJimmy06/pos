# Guía de Funcionamiento de CRUD y Arquitectura

Este documento explica cómo funcionan las operaciones **CRUD** (Create, Read, Update, Delete) en este proyecto y qué responsabilidad tiene cada archivo dentro de la arquitectura.

---

## 1. ¿Qué es CRUD?

CRUD es un acrónimo que representa las cuatro operaciones básicas de la gestión de datos:

1.  **C**reate (Crear): Insertar nuevos registros (ej. `POST /products`).
2.  **R**ead (Leer): Consultar datos existentes (ej. `GET /products`).
3.  **U**pdate (Actualizar): Modificar registros (ej. `PUT /products/:id`).
4.  **D**elete (Borrar): Eliminar registros o desactivarlos (ej. `DELETE /products/:id`).

---

## 2. Flujo de una Operación (Arquitectura Hexagonal)

En este proyecto, seguimos una **Arquitectura Hexagonal (o Clean Architecture)**. Cuando hacés un CRUD, los datos viajan a través de varias capas:

### A. Capa de Presentación (`src/presentation`)
Es la cara visible. Aquí es donde el usuario interactúa.
-   **Componentes (`/components`)**: Los formularios que capturan los datos (ej. el modal para crear un producto).
-   **Páginas (`/pages`)**: Orquestan los componentes de una sección (ej. `ProductsPage.tsx`).
-   **Hooks (`/hooks`)**: Usamos **React Query** para manejar el estado asíncrono. Los hooks llaman a los servicios de infraestructura.

### B. Capa de Aplicación (`src/application`)
Contiene la **lógica de negocio** pura.
-   **Use Cases (`/use-cases`)**: Son clases o funciones que ejecutan una acción específica. Por ejemplo, `AddItemToInvoiceUseCase` contiene la lógica de validación antes de agregar un item.
-   *Nota: En esta arquitectura, el Use Case no sabe nada de la base de datos, solo usa interfaces.*

### C. Capa de Dominio (`src/domain`)
Es el corazón del sistema. Define las reglas que no cambian.
-   **Entities (`/entities`)**: Modelos de datos (ej. `Product.ts`).
-   **Repositories (Interfaces) (`/repositories`)**: Contratos que dicen *qué* se puede hacer, pero no *cómo*. Ejemplo: `IProductRepository` dice que debe existir un método `save()`.

### D. Capa de Infraestructura (`src/infrastructure`)
Es la implementación técnica (el "cómo").
-   **Repositories (Implementación) (`/repositories`)**: Aquí está el código que realmente habla con la API usando el `api-client`.
-   **API Client (`/api`)**: Configuración de Axios o Fetch para las peticiones HTTP.
-   **Mappers (`/mappers`)**: Transforman los datos que vienen de la base de datos (JSON) a objetos de dominio que el front entiende.

---

## 3. Ejemplo: Crear un Producto

Si querés ver qué archivos tocan cada parte al crear algo:

1.  **Usuario hace click en Guardar**: El componente de React recolecta los datos.
2.  **Llamada al Hook**: Un hook como `useCreateProduct` se dispara.
3.  **Repositorio de Infraestructura**: El hook llama al método `create` del `ApiProductRepository`.
4.  **Petición HTTP**: El `api-client` envía un `POST` al backend.
5.  **Respuesta**: Los datos vuelven, el `Mapper` los limpia, y React Query actualiza la pantalla automáticamente.

---

## 4. Resumen de Archivos Clave

| Archivo | Responsabilidad |
| :--- | :--- |
| `*.entities.ts` | Define qué datos tiene un objeto (id, nombre, precio). |
| `*.use-case.ts` | Contiene la lógica o "reglas" de esa acción específica. |
| `*-repository.ts` | Se encarga de la comunicación real con el servidor. |
| `use-*.ts` (Hook) | Maneja la carga, el error y el éxito en la UI. |
| `*.tsx` (Page/Comp) | Renderiza el HTML y escucha eventos del usuario. |

---

¡Recordá que la idea de separar todo esto es que, si mañana cambiamos la base de datos o la API, solo tengamos que tocar la carpeta de **Infraestructura**, dejando el resto de la aplicación intacta!
