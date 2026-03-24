# Freestyle Types

Freestyle line rendering type hierarchy and data structures. For the scripting pipeline see [freestyle-scripting](freestyle-scripting.md).

## Type Hierarchy

Freestyle operates on a view map — a 2D projection of 3D edges classified by their visual nature.

### Core Types

```
Interface0D (point)
├── SVertex (mesh vertex in view map)
├── ViewVertex
│   ├── TVertex (T-junction vertex)
│   └── NonTVertex (non-junction vertex)
├── CurvePoint (point on a curve)
└── StrokeVertex (point on a stroke)

Interface1D (curve)
├── FEdge (feature edge between two SVertices)
│   ├── FEdgeSharp (silhouette/border/crease)
│   └── FEdgeSmooth (smooth edge)
├── ViewEdge (chain of FEdges with consistent nature)
├── Chain (chain of ViewEdges)
└── Stroke (final rendered line)
```

## Nature Constants

Edge nature classification flags from `freestyle.types.Nature`:

| Constant | Description |
|---|---|
| `Nature.SILHOUETTE` | Silhouette edge (front-face/back-face boundary) |
| `Nature.BORDER` | Mesh boundary edge |
| `Nature.CREASE` | Sharp angle between adjacent faces |
| `Nature.RIDGE` | Convex ridge |
| `Nature.VALLEY` | Concave valley |
| `Nature.SUGGESTIVE_CONTOUR` | Suggestive contour line |
| `Nature.MATERIAL_BOUNDARY` | Material change boundary |
| `Nature.EDGE_MARK` | User-marked freestyle edge |

```python
from freestyle.types import Nature

# Nature values can be combined with bitwise OR
nature = Nature.SILHOUETTE | Nature.BORDER
```

## ViewMap

The view map holds all computed view edges and vertices:

```python
from freestyle.types import ViewMap

# Available inside style modules
# viewmap = getCurrentViewMap()  # via freestyle.utils

# Access all view edges
for ve in viewmap.view_edges:
    print(ve.nature, ve.qi)

# Access all view vertices
for vv in viewmap.view_vertices:
    print(type(vv).__name__)
```

## ViewEdge

A chain of connected feature edges with consistent nature:

```python
from freestyle.types import ViewEdge

# Properties
ve.nature                # Nature flags
ve.qi                    # quantitative invisibility (occlusion count)
ve.first_viewvertex      # start ViewVertex
ve.last_viewvertex       # end ViewVertex
ve.first_fedge           # first FEdge in chain
ve.last_fedge            # last FEdge in chain
ve.id                    # unique ID
```

## FEdge

Feature edge between two SVertices:

```python
from freestyle.types import FEdge, FEdgeSharp, FEdgeSmooth

# Common properties
fedge.first_svertex      # start SVertex
fedge.second_svertex     # end SVertex
fedge.nature             # Nature flags
fedge.is_smooth          # True if FEdgeSmooth

# FEdgeSharp specific
sharp.normal_left        # left face normal
sharp.normal_right       # right face normal
sharp.material_index     # material index

# FEdgeSmooth specific
smooth.face_mark         # face mark flag
smooth.material_index    # material index
smooth.normal            # interpolated normal
```

## SVertex

Mesh vertex in the view map:

```python
from freestyle.types import SVertex

sv.point_2d              # 2D projected position (Vector)
sv.point_3d              # 3D world position (Vector)
sv.normal                # vertex normal (Vector)
sv.curvatures            # curvature info tuple
sv.id                    # unique ID
```

## Stroke and StrokeVertex

The final rendered line and its vertices:

```python
from freestyle.types import Stroke, StrokeVertex

# Stroke properties
stroke.id                # unique ID
stroke.length_2d         # total 2D length

# StrokeVertex properties
sv.point                 # 2D position
sv.attribute             # StrokeAttribute (color, alpha, thickness)
sv.curvilinear_abscissa  # distance along stroke from start
sv.stroke_length         # total stroke length
sv.t                     # parameter [0, 1] along stroke

# StrokeAttribute
sv.attribute.color       # (r, g, b) tuple
sv.attribute.alpha       # float
sv.attribute.thickness   # (left, right) tuple
```

## Iterator Types

| Iterator | Yields | Description |
|---|---|---|
| `Interface0DIterator` | Interface0D | Generic point iterator |
| `AdjacencyIterator` | ViewEdge | Adjacent edges at a ViewVertex |
| `CurvePointIterator` | CurvePoint | Points along a curve |
| `StrokeVertexIterator` | StrokeVertex | Vertices along a stroke |
| `ViewEdgeIterator` | ViewEdge | View edges traversal |
| `SVertexIterator` | SVertex | SVertices along an FEdge chain |

## Common Patterns

### Inspect View Edges

```python
from freestyle.types import Nature

def analyze_view_edges(viewmap):
    silhouettes = 0
    creases = 0
    for ve in viewmap.view_edges:
        if ve.nature & Nature.SILHOUETTE:
            silhouettes += 1
        if ve.nature & Nature.CREASE:
            creases += 1
    return silhouettes, creases
```

### Walk Stroke Vertices

```python
from freestyle.types import Stroke

def get_stroke_points(stroke):
    points = []
    for i in range(stroke.stroke_vertices_size()):
        sv = stroke[i]
        points.append((sv.point.x, sv.point.y))
    return points
```

## Gotchas

1. **Nature is a bitmask.** Use bitwise AND (`&`) to test flags: `if ve.nature & Nature.SILHOUETTE`. Don't use `==` since an edge can have multiple natures.

2. **2D vs 3D coordinates.** `SVertex.point_2d` is the screen-projected position. `SVertex.point_3d` is the original world position. Most freestyle operations work in 2D.

3. **Quantitative invisibility (qi).** `ViewEdge.qi` counts how many surfaces occlude the edge. `qi == 0` means fully visible. Use `QuantitativeInvisibilityUP1D(0)` to select only visible edges.

4. **Type checking.** Use `isinstance` or check `is_smooth` on FEdges. Not all FEdges are the same subtype.

5. **Iterator invalidation.** Don't modify the view map while iterating. Copy data first if you need to filter or transform.
