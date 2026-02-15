# NodeExpressAprender

API REST CRUD de pizzas con **Node.js + Express**.

## Instalacion y ejecucion

```bash
npm install
npm start
```

Servidor: `http://localhost:3000`

## Tabla de Endpoints

| Metodo | Ruta | Descripcion | Ejemplo |
|---|---|---|---|
| GET | `/pizzas` | Lista todas las pizzas | `GET http://localhost:3000/pizzas` |
| GET | `/pizzas?name=texto` | Filtra por nombre | `GET http://localhost:3000/pizzas?name=pep` |
| GET | `/pizzas/:id` | Obtiene pizza por ID | `GET http://localhost:3000/pizzas/1` |
| POST | `/pizzas` | Crea una nueva pizza | `POST http://localhost:3000/pizzas` |
| PUT | `/pizzas/:id` | Actualiza una pizza existente | `PUT http://localhost:3000/pizzas/1` |
| DELETE | `/pizzas/:id` | Elimina una pizza | `DELETE http://localhost:3000/pizzas/1` |

## Body JSON (POST / PUT)

```json
{
  "name": "Hawaiana",
  "toppings": ["salsa de tomate", "queso mozzarella", "pina", "jamon"],
  "price": 13.5
}
```

## Como probar en Postman o Insomnia

1. Crear una coleccion/workspace.
2. Crear requests para cada endpoint.
3. En `POST` y `PUT`: **Body > RAW > JSON**.
4. Enviar y validar respuesta.

## Codigos de estado esperados

| Codigo | Significado |
|---|---|
| 200 | OK |
| 201 | Created |
| 400 | Bad Request |
| 404 | Not Found |
| 500 | Internal Server Error |

## Nota

Los datos se guardan en `pizzas.json`.
