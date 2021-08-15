import React, {useEffect, useState} from 'react';
import {createPortal} from 'react-dom';
import {
  CancelDrop,
  closestCorners,
  CollisionDetection,
  DndContext,
  DragOverlay,
  DropAnimation,
  defaultDropAnimation,
  KeyboardSensor,
  Modifiers,
  PointerSensor,
  useDroppable,
  UniqueIdentifier,
  useSensors,
  useSensor,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  SortingStrategy,
} from '@dnd-kit/sortable';

import {Item, List} from './components';

import {createRange} from './utilities';
import {MultipleContainers} from './MultipleContainers';

export default function App() {
  var [children, setChildren] = useState([
    ["A1", "A2", "A3"],
    ["B1", "B2", "B3"],
  ])

  const [clonedChildren, setClonedChildren] = useState(null)
  const [activeID, setActiveID] = useState(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const onDragCancel = () => {
    if(clonedChildren)
      setChildren(clonedChildren)
    setActiveID(null)
    setClonedChildren(null)
  }

  const OnDragEnd = ({ active, over }) => {
  }

  const OnDragOver = ({ active, over }) => {
  }

  return <MultipleContainers/>
}
