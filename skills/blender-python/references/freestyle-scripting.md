# Freestyle Scripting

Freestyle style module pipeline for programmatic line art control. For type definitions see [freestyle-types](freestyle-types.md).

## Pipeline Overview

The freestyle pipeline processes view edges through five stages:

```
Selection → Chaining → Splitting → Sorting → Stroke Creation
```

All stages use `freestyle.Operators`:

```python
from freestyle import Operators
```

## Setup

Enable freestyle and configure for script mode:

```python
import bpy

view_layer = bpy.context.view_layer
view_layer.use_freestyle = True

# FreestyleSettings
fs = view_layer.freestyle_settings
fs.mode = 'SCRIPT'  # 'SCRIPT' or 'EDITOR'

# Add a style module
module = fs.modules.new()
module.script = bpy.data.texts["my_style.py"]
module.use = True
```

## Style Module Template

A complete style module script:

```python
from freestyle import Operators
from freestyle.predicates import (
    QuantitativeInvisibilityUP1D,
    TrueUP1D,
)
from freestyle.chainingiterators import ChainSilhouetteIterator
from freestyle.shaders import (
    ConstantColorShader,
    ConstantThicknessShader,
    SamplingShader,
)

# 1. Selection — choose which view edges to render
Operators.select(QuantitativeInvisibilityUP1D(0))  # visible edges only

# 2. Chaining — connect edges into chains
Operators.bidirectional_chain(ChainSilhouetteIterator())

# 3. Splitting (optional) — break chains at conditions
# Operators.sequential_split(TrueUP0D(), 50)

# 4. Sorting (optional) — control draw order
Operators.sort(TrueUP1D())

# 5. Stroke creation — apply shaders and create strokes
shaders = [
    SamplingShader(5.0),                    # resample at 5px
    ConstantThicknessShader(3.0),           # 3px thick
    ConstantColorShader(0.0, 0.0, 0.0, 1.0),  # black
]
Operators.create(TrueUP1D(), shaders)
```

## Selection

```python
from freestyle import Operators
from freestyle.predicates import (
    QuantitativeInvisibilityUP1D,
    ContourUP1D,
    ExternalContourUP1D,
    NotUP1D,
    AndUP1D,
    OrUP1D,
    TrueUP1D,
    FalseUP1D,
)
from freestyle.types import Nature

# Select visible edges
Operators.select(QuantitativeInvisibilityUP1D(0))

# Select contour edges
Operators.select(ContourUP1D())

# Combine predicates
Operators.select(
    AndUP1D(
        QuantitativeInvisibilityUP1D(0),
        NotUP1D(ExternalContourUP1D())
    )
)
```

## Chaining

```python
from freestyle import Operators
from freestyle.chainingiterators import (
    ChainSilhouetteIterator,
    ChainPredicateIterator,
)

# Chain silhouette edges
Operators.bidirectional_chain(ChainSilhouetteIterator())

# Or with a chaining predicate
Operators.chain(ChainSilhouetteIterator())
```

## Splitting

```python
from freestyle import Operators
from freestyle.predicates import TrueUP0D

# Sequential split at every N units along the chain
Operators.sequential_split(TrueUP0D(), 100.0)  # split every 100 units

# Recursive split at points meeting a condition
# Operators.recursive_split(func, min_length)
```

## Sorting

```python
from freestyle import Operators
from freestyle.predicates import TrueUP1D

# Sort by a unary predicate (determines draw order)
Operators.sort(TrueUP1D())
```

## Stroke Creation with Shaders

```python
from freestyle import Operators
from freestyle.predicates import TrueUP1D
from freestyle.shaders import (
    ConstantColorShader,
    ConstantThicknessShader,
    IncreasingThicknessShader,
    SamplingShader,
    StrokeTextureStepShader,
    CalligraphicShader,
    SpatialNoiseShader,
    BackboneStretcherShader,
    TipRemoverShader,
)

shaders = [
    SamplingShader(2.0),
    ConstantThicknessShader(2.0),
    ConstantColorShader(0.0, 0.0, 0.0, 1.0),
]
Operators.create(TrueUP1D(), shaders)
```

### Built-in Shaders

| Shader | Description |
|---|---|
| `ConstantColorShader(r, g, b, a)` | Uniform stroke color |
| `ConstantThicknessShader(thickness)` | Uniform stroke width |
| `IncreasingThicknessShader(min, max)` | Thickness increases along stroke |
| `SamplingShader(step)` | Resample stroke at step interval |
| `StrokeTextureStepShader(step)` | Texture coordinate step |
| `CalligraphicShader(min, max, orientation, clamp)` | Calligraphic pen effect |
| `SpatialNoiseShader(amount, scale, octaves, smooth, pure_random)` | Add noise |
| `BackboneStretcherShader(amount)` | Extend stroke ends |
| `TipRemoverShader(length)` | Remove stroke tips |

## Predicates

### Unary Predicates (1D — per chain/stroke)

| Predicate | Description |
|---|---|
| `TrueUP1D()` | Always true |
| `FalseUP1D()` | Always false |
| `NotUP1D(pred)` | Negate a predicate |
| `AndUP1D(pred1, pred2)` | Logical AND |
| `OrUP1D(pred1, pred2)` | Logical OR |
| `QuantitativeInvisibilityUP1D(qi)` | Edge visibility (0 = visible) |
| `ContourUP1D()` | Is contour edge |
| `ExternalContourUP1D()` | Is external contour |

### Unary Predicates (0D — per point)

| Predicate | Description |
|---|---|
| `TrueUP0D()` | Always true |
| `FalseUP0D()` | Always false |

## Functions

`freestyle.functions` provides value extractors for use in custom predicates:

```python
from freestyle.functions import (
    GetXF0D, GetYF0D, GetZF0D,       # coordinate accessors
    GetCurvilinearAbscissaF0D,         # distance along stroke
    GetProjectedXF0D, GetProjectedYF0D, GetProjectedZF0D,
)
```

## Utilities

```python
from freestyle.utils import (
    getCurrentScene,
    integrate,
    ContextFunctions,
)
```

## Common Patterns

### Thick Silhouettes, Thin Creases

```python
from freestyle import Operators
from freestyle.predicates import (
    QuantitativeInvisibilityUP1D,
    pyNatureUP1D,
    NotUP1D,
    AndUP1D,
)
from freestyle.chainingiterators import ChainSilhouetteIterator
from freestyle.shaders import (
    SamplingShader,
    ConstantThicknessShader,
    ConstantColorShader,
)
from freestyle.types import Nature

# Pass 1: Thick silhouettes
Operators.select(AndUP1D(
    QuantitativeInvisibilityUP1D(0),
    pyNatureUP1D(Nature.SILHOUETTE),
))
Operators.bidirectional_chain(ChainSilhouetteIterator())
Operators.create(QuantitativeInvisibilityUP1D(0), [
    SamplingShader(5.0),
    ConstantThicknessShader(4.0),
    ConstantColorShader(0, 0, 0, 1),
])

# Pass 2: Thin creases
Operators.select(AndUP1D(
    QuantitativeInvisibilityUP1D(0),
    pyNatureUP1D(Nature.CREASE),
))
Operators.bidirectional_chain(ChainSilhouetteIterator())
Operators.create(QuantitativeInvisibilityUP1D(0), [
    SamplingShader(5.0),
    ConstantThicknessShader(1.0),
    ConstantColorShader(0.3, 0.3, 0.3, 1),
])
```

## Gotchas

1. **Script mode vs Editor mode.** `mode = 'SCRIPT'` uses Python style modules. `mode = 'EDITOR'` uses the UI-configured linesets. Both produce freestyle lines but use different configuration paths.

2. **Pipeline order is fixed.** Selection → Chaining → Splitting → Sorting → Creation. Each `Operators` call modifies global state. The order matters.

3. **Operators modify global state.** Each pipeline step operates on the current working set. `select()` filters the set, `chain()` connects edges, `create()` produces strokes. State resets between render passes.

4. **Style modules run per view layer.** Each view layer's freestyle settings can have multiple style modules that run in order.

5. **`pyNatureUP1D` for nature filtering.** Use `freestyle.predicates.pyNatureUP1D(Nature.SILHOUETTE)` to filter by nature type in selection predicates.
