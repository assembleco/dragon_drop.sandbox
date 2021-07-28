import React, {useState} from 'react';
import styled from "styled-components"
import {
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';

import {SortableItem} from './SortableItem';
import {Item} from './Item';

function App() {
  const [activeId, setActiveId] = useState(null);
  const [items, setItems] = useState(['1', '2', '3', '4', '5', '6', '7', '8', '9']);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={items}
        strategy={rectSortingStrategy}
      >
        <Container>
          {items.map(id => <SortableItem key={id} id={id} />)}
        </Container>
      </SortableContext>

      <DragOverlay>
        {activeId ? <Item id={activeId} /> : null}
      </DragOverlay>
    </DndContext>
  );

  function handleDragStart(event) {
    const {active} = event;

    setActiveId(active.id);
  }

  function handleDragEnd(event) {
    const {active, over} = event;

    if (active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }

    setActiveId(null);
  }
}

var Container = styled.div`
display: flex;
flex-direction: row;
flex-wrap: wrap;
`

export default App
