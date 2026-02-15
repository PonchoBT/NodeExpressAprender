const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const { CONNREFUSED } = require('dns');

const app = express();
const PORT = process.env.PORT || 3000;
app.use(bodyParser.json());

// ============= CRUD OPERATIONS =============

// CREATE (C) - Crear una nueva pizza
app.post('/pizzas', (req, res) => {
    const newPizza = req.body;
    
    fs.readFile('pizzas.json', 'utf8', (err, data) => {
        if (err) {
            console.error('Error al leer el archivo JSON:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }

        try {
            const pizzas = JSON.parse(data);
            
            // Validar que se proporcionen los campos requeridos
            if (!newPizza.name || !newPizza.toppings || !newPizza.price) {
                return res.status(400).json({ error: 'Faltan campos requeridos' });
            }

            // Verificar si ya existe una pizza con el mismo nombre
            const pizzaExistente = pizzas.find(p => p.name.toLowerCase() === newPizza.name.toLowerCase());
            if (pizzaExistente) {
                return res.status(400).json({ error: 'Ya existe una pizza con este nombre' });
            }

            // Generar un nuevo ID (usando el último ID + 1)
            const lastId = pizzas.length > 0 ? Math.max(...pizzas.map(p => p.id)) : 0;
            newPizza.id = lastId + 1;

            // Agregar la nueva pizza al array
            pizzas.push(newPizza);

            // Guardar el archivo actualizado
            fs.writeFile('pizzas.json', JSON.stringify(pizzas, null, 2), (err) => {
                if (err) {
                    console.error('Error al escribir en el archivo JSON:', err);
                    return res.status(500).json({ error: 'Error interno del servidor' });
                }
                res.status(201).json(newPizza);
            });
        } catch (error) {
            console.error('Error al procesar JSON:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    });
});

// READ (R) - Obtener todas las pizzas
app.get('/pizzas', (req, res) => {
    fs.readFile('pizzas.json', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
            return;
        }
        try {
            const pizzas = JSON.parse(data);
            const { name } = req.query;

            const filteredPizzas = name
                ? pizzas.filter((pizza) =>
                    pizza.name.toLowerCase().includes(String(name).toLowerCase().trim())
                )
                : pizzas;

            // Configurar el header para formato JSON y espaciado de 2
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(filteredPizzas, null, 2));
        } catch (error) {
            console.error('Error al procesar JSON:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    });
});

// READ (R) - Obtener una pizza por ID
app.get('/pizzas/:id', (req, res) => {
    const id = parseInt(req.params.id);
    fs.readFile('pizzas.json', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error interno del servidor');
            return;
        }
        try {
            const pizzas = JSON.parse(data);
            const pizza = pizzas.find(p => p.id === id);
            
            if (!pizza) {
                return res.status(404).json({ message: "Pizza no encontrada" });
            }
            
            res.json(pizza);
        } catch (error) {
            console.error('Error al procesar JSON:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    });
});

// UPDATE (U) - Actualizar una pizza existente
app.put('/pizzas/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const updatedPizza = req.body;

    fs.readFile('pizzas.json', 'utf8', (err, data) => {
        if (err) {
            console.error('Error al leer el archivo JSON:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }

        try {
            const pizzas = JSON.parse(data);
            const pizzaIndex = pizzas.findIndex(p => p.id === id);

            if (pizzaIndex === -1) {
                return res.status(404).json({ error: 'Pizza no encontrada' });
            }

            // Validar que se proporcionen los campos requeridos
            if (!updatedPizza.name || !updatedPizza.toppings || !updatedPizza.price) {
                return res.status(400).json({ error: 'Faltan campos requeridos' });
            }

            // Mantener el mismo ID
            updatedPizza.id = id;
            
            // Actualizar la pizza
            pizzas[pizzaIndex] = updatedPizza;

            // Guardar el archivo actualizado
            fs.writeFile('pizzas.json', JSON.stringify(pizzas, null, 2), (err) => {
                if (err) {
                    console.error('Error al escribir en el archivo JSON:', err);
                    return res.status(500).json({ error: 'Error interno del servidor' });
                }
                res.json(updatedPizza);
            });
        } catch (error) {
            console.error('Error al procesar JSON:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    });
});

// DELETE (D) - Eliminar una pizza
app.delete('/pizzas/:id', (req, res) => {
    const id = parseInt(req.params.id);

    fs.readFile('pizzas.json', 'utf8', (err, data) => {
        if (err) {
            console.error('Error al leer el archivo JSON:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }

        try {
            const pizzas = JSON.parse(data);
            const pizzaIndex = pizzas.findIndex(p => p.id === id);

            if (pizzaIndex === -1) {
                return res.status(404).json({ error: 'Pizza no encontrada' });
            }

            // Eliminar la pizza del array
            pizzas.splice(pizzaIndex, 1);

            // Guardar el archivo actualizado
            fs.writeFile('pizzas.json', JSON.stringify(pizzas, null, 2), (err) => {
                if (err) {
                    console.error('Error al escribir en el archivo JSON:', err);
                    return res.status(500).json({ error: 'Error interno del servidor' });
                }
                res.status(200).json({ message: 'Pizza eliminada correctamente' });
            });
        } catch (error) {
            console.error('Error al procesar JSON:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    });
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT} 🚀`);
});

/*
CRUD Operations Summary:
----------------------
C: CREATE  - POST   /pizzas      - Crea una nueva pizza
R: READ    - GET    /pizzas      - Obtiene todas las pizzas
R: READ    - GET    /pizzas/:id  - Obtiene una pizza específica
U: UPDATE  - PUT    /pizzas/:id  - Actualiza una pizza existente
D: DELETE  - DELETE /pizzas/:id  - Elimina una pizza
*/
/*
Ejemplo:
GET http://localhost:3000/pizzas/1

Response:
{
  "id": 1,
  "name": "Margherita",
  "toppings": ["salsa de tomate", "queso mozzarella", "albahaca fresca"],
  "price": 9.99
}
*/