# 🌐 Sistema de Referidos Win2Win

Este proyecto implementa un **esquema de matriz 5x7**, donde cada usuario puede invitar a un máximo de **5 personas directas**. A partir de ahí, los nuevos referidos se asignan automáticamente en los siguientes niveles, hasta un **máximo de 7 niveles de profundidad**, que son los niveles donde se generan ganancias.

# 🔹 1. Estructura del árbol

Cada usuario puede tener máximo 5 referidos directos (primer nivel).

Cuando un usuario ya tiene 5, los nuevos referidos se asignan en cascada al siguiente nivel más cercano con espacio disponible.

Esto genera un árbol balanceado en el que cada nodo = un usuario, y cada nivel representa la "generación" de referidos.

# 🔹 2. Representación en niveles

Nivel 0: Usuario raíz (el que comienza).

Nivel 1: Hasta 5 personas.

Nivel 2: Cada persona del nivel 1 puede tener hasta 5 → máximo 25.

Nivel 3: Cada persona del nivel 2 puede tener hasta 5 → máximo 125.

Nivel n: Crece exponencialmente: 5 𝑛 5 n.

# 🔹 3. Ejemplo gráfico (3 niveles)

```csharp
             [Tú]
     ┌────┬────┬────┬────┐
    P1    P2   P3   P4   P5
   /|\   /|\   ...
  25 max (5 cada uno)
```

- **Nivel 1**: 5 personas.
- **Nivel 2**: 25 personas (5 por cada uno del nivel 1).
- **Nivel 3**: 125 personas.
- Hasta **nivel 7** con un máximo de **78,125 personas** en ese nivel.  

👉 Total hasta nivel 3 = **155 personas**.

---

### 4. Tabla de referencia

| Nivel | Referidos posibles | Total acumulado |
|-------|--------------------|-----------------|
| 1     | 5                  | 5               |
| 2     | 25                 | 30              |
| 3     | 125                | 155             |
| 4     | 625                | 780             |
| 5     | 3,125              | 3,905           |
| 6     | 15,625             | 19,530          |
| 7     | 78,125             | 97,655          |

---
