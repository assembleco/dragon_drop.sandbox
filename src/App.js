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
  return <MultipleContainers/>
}
