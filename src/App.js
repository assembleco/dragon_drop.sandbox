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

var Wrapper = (props) => {
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
      {...props}
    />
  )
}

class App extends React.Component {
  state = {
    items: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
    activeId: null,
  }

  render = () => {
    return (
      <Wrapper
        onDragStart={this.handleDragStart.bind(this)}
        onDragEnd={this.handleDragEnd.bind(this)}
      >
        <SortableContext
          items={this.state.items}
          strategy={rectSortingStrategy}
        >
          <Container>
            {this.state.items.map(id => <SortableItem key={id} id={id} />)}
          </Container>
        </SortableContext>

        <DragOverlay>
          {this.state.activeId ? <Item id={this.state.activeId} /> : null}
        </DragOverlay>
      </Wrapper>
    );
  }

  handleDragStart(event) {
    const {active} = event;

    this.setState({ activeId: active.id })
  }

  handleDragEnd(event) {
    const {active, over} = event;

    if (active.id !== over.id) {
      const oldIndex = this.state.items.indexOf(active.id);
      const newIndex = this.state.items.indexOf(over.id);

      this.setItems(arrayMove(this.state.items, oldIndex, newIndex))
    }

    this.setState({ activeId: null })
  }

  setItems(items) {
    this.setState({ items })
  }
}

var Container = styled.div`
display: flex;
flex-direction: row;
flex-wrap: wrap;
`

export default App
