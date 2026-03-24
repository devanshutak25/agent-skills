# Drag & Drop Libraries

## Decision Matrix

| Library | Bundle | Approach | Best For |
|---------|--------|----------|----------|
| **dnd-kit** | ~12 kB | React-specific, modular | Sortable lists, kanban, grid DnD |
| **pragmatic-drag-and-drop** | ~5 kB (core) | Native HTML5 DnD | File drops, cross-framework, Atlassian ecosystem |
| **Swapy** | ~3 kB | Layout swapping | Simple slot-based swapping |

**react-beautiful-dnd**: Deprecated. Migrate to pragmatic-drag-and-drop or dnd-kit.

---

## dnd-kit

```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

### Sortable List
```tsx
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableItem({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
}

function SortableList() {
  const [items, setItems] = useState(['Item 1', 'Item 2', 'Item 3']);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setItems((prev) => {
        const oldIndex = prev.indexOf(active.id as string);
        const newIndex = prev.indexOf(over.id as string);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  }

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        {items.map((item) => (
          <SortableItem key={item} id={item}>{item}</SortableItem>
        ))}
      </SortableContext>
    </DndContext>
  );
}
```

### Kanban Board (Multiple Containers)
```tsx
import { DndContext, DragOverlay, useDroppable } from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';

function Column({ id, items }: { id: string; items: Task[] }) {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div ref={setNodeRef}>
      <SortableContext items={items.map(i => i.id)}>
        {items.map(item => (
          <SortableItem key={item.id} id={item.id}>
            <TaskCard task={item} />
          </SortableItem>
        ))}
      </SortableContext>
    </div>
  );
}

function KanbanBoard() {
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  return (
    <DndContext
      onDragStart={({ active }) => setActiveTask(findTask(active.id))}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver} // move between columns
    >
      <div className="flex gap-4">
        {columns.map(col => (
          <Column key={col.id} id={col.id} items={col.tasks} />
        ))}
      </div>
      <DragOverlay>
        {activeTask && <TaskCard task={activeTask} />}
      </DragOverlay>
    </DndContext>
  );
}
```

### Key Features
- Keyboard navigation and screen reader support
- Custom collision detection algorithms
- Drag overlay (portal-based) for smooth visuals
- Grid, horizontal, and vertical sorting strategies
- Sensors: pointer, keyboard, touch

---

## pragmatic-drag-and-drop (Atlassian)

```bash
npm install @atlaskit/pragmatic-drag-and-drop
```

### Basic Draggable
```tsx
import { draggable, dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';

function DraggableCard({ item }: { item: Item }) {
  const ref = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const el = ref.current!;
    return draggable({
      element: el,
      getInitialData: () => ({ id: item.id }),
      onDragStart: () => setIsDragging(true),
      onDrop: () => setIsDragging(false),
    });
  }, [item.id]);

  return (
    <div ref={ref} style={{ opacity: isDragging ? 0.5 : 1 }}>
      {item.name}
    </div>
  );
}

function DropZone({ onDrop }: { onDrop: (id: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [isOver, setIsOver] = useState(false);

  useEffect(() => {
    const el = ref.current!;
    return dropTargetForElements({
      element: el,
      onDragEnter: () => setIsOver(true),
      onDragLeave: () => setIsOver(false),
      onDrop: ({ source }) => {
        setIsOver(false);
        onDrop(source.data.id as string);
      },
    });
  }, [onDrop]);

  return (
    <div ref={ref} style={{ background: isOver ? '#e0e0e0' : 'transparent' }}>
      Drop here
    </div>
  );
}
```

### File Drop Support
```tsx
import { dropTargetForExternal } from '@atlaskit/pragmatic-drag-and-drop/external/adapter';
import { containsFiles, getFiles } from '@atlaskit/pragmatic-drag-and-drop/external/file';

useEffect(() => {
  return dropTargetForExternal({
    element: ref.current!,
    canDrop: containsFiles,
    onDrop: ({ source }) => {
      const files = getFiles({ source });
      handleFileUpload(files);
    },
  });
}, []);
```

### Key Advantages over dnd-kit
- Framework-agnostic (works with React, Vue, Svelte, vanilla)
- Built on native HTML5 DnD API (file drops supported)
- Smaller core bundle (~5 kB)
- Atlassian uses it in Jira, Confluence, Trello

### Key Disadvantage
- More imperative API (useEffect + refs vs declarative components)
- Less built-in accessibility than dnd-kit

---

## Choosing Guide

```
Sortable lists / Kanban with a11y?     → dnd-kit
File drops / cross-framework?          → pragmatic-drag-and-drop
Simple slot swapping?                  → Swapy
Migrating from react-beautiful-dnd?    → pragmatic-drag-and-drop (same team)
```
