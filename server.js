const express = require("express");
const fs = require("node:fs/promises");
const path = require("node:path");

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, "pizzas.json");

app.use(express.json());

function hasRequiredFields(pizza) {
  return (
    pizza &&
    typeof pizza.name === "string" &&
    Array.isArray(pizza.toppings) &&
    pizza.price !== undefined &&
    pizza.price !== null
  );
}

async function readPizzas() {
  const data = await fs.readFile(DATA_FILE, "utf8");
  return JSON.parse(data);
}

async function savePizzas(pizzas) {
  await fs.writeFile(DATA_FILE, JSON.stringify(pizzas, null, 2));
}

function handleServerError(res, error, message) {
  console.error(message, error);
  return res.status(500).json({ error: "Error interno del servidor" });
}

// CREATE (C) - Crear una nueva pizza
app.post("/pizzas", async (req, res) => {
  const newPizza = req.body;

  if (!hasRequiredFields(newPizza)) {
    return res.status(400).json({ error: "Faltan campos requeridos" });
  }

  try {
    const pizzas = await readPizzas();

    const pizzaExistente = pizzas.find(
      (pizza) => pizza.name.toLowerCase() === newPizza.name.toLowerCase()
    );

    if (pizzaExistente) {
      return res.status(400).json({ error: "Ya existe una pizza con este nombre" });
    }

    const lastId = pizzas.length > 0 ? Math.max(...pizzas.map((pizza) => pizza.id)) : 0;
    const pizzaToCreate = { ...newPizza, id: lastId + 1 };

    pizzas.push(pizzaToCreate);
    await savePizzas(pizzas);

    return res.status(201).json(pizzaToCreate);
  } catch (error) {
    return handleServerError(res, error, "Error al crear pizza:");
  }
});

// READ (R) - Obtener todas las pizzas
app.get("/pizzas", async (req, res) => {
  try {
    const pizzas = await readPizzas();
    const { name } = req.query;

    const filteredPizzas = name
      ? pizzas.filter((pizza) =>
          pizza.name.toLowerCase().includes(String(name).toLowerCase().trim())
        )
      : pizzas;

    return res.status(200).json(filteredPizzas);
  } catch (error) {
    return handleServerError(res, error, "Error al obtener pizzas:");
  }
});

// READ (R) - Obtener una pizza por ID
app.get("/pizzas/:id", async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);

  try {
    const pizzas = await readPizzas();
    const pizza = pizzas.find((item) => item.id === id);

    if (!pizza) {
      return res.status(404).json({ message: "Pizza no encontrada" });
    }

    return res.status(200).json(pizza);
  } catch (error) {
    return handleServerError(res, error, "Error al obtener pizza por ID:");
  }
});

// UPDATE (U) - Actualizar una pizza existente
app.put("/pizzas/:id", async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  const updatedPizza = req.body;

  if (!hasRequiredFields(updatedPizza)) {
    return res.status(400).json({ error: "Faltan campos requeridos" });
  }

  try {
    const pizzas = await readPizzas();
    const pizzaIndex = pizzas.findIndex((pizza) => pizza.id === id);

    if (pizzaIndex === -1) {
      return res.status(404).json({ error: "Pizza no encontrada" });
    }

    const pizzaToSave = { ...updatedPizza, id };
    pizzas[pizzaIndex] = pizzaToSave;

    await savePizzas(pizzas);
    return res.status(200).json(pizzaToSave);
  } catch (error) {
    return handleServerError(res, error, "Error al actualizar pizza:");
  }
});

// DELETE (D) - Eliminar una pizza
app.delete("/pizzas/:id", async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);

  try {
    const pizzas = await readPizzas();
    const pizzaIndex = pizzas.findIndex((pizza) => pizza.id === id);

    if (pizzaIndex === -1) {
      return res.status(404).json({ error: "Pizza no encontrada" });
    }

    pizzas.splice(pizzaIndex, 1);
    await savePizzas(pizzas);

    return res.status(200).json({ message: "Pizza eliminada correctamente" });
  } catch (error) {
    return handleServerError(res, error, "Error al eliminar pizza:");
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT} 🚀`);
});