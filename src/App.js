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

import { Item, List } from "./components"

export default function App() {
  var [items, setItems] = useState({
    A: ["A1", "A2", "A3"],
    B: ["B1", "B2", "B3"],
  })

  const [clonedItems, setClonedItems] = useState(null)
  const [activeId, setActiveId] = useState(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const findContainer = (id: string) => {
    if (id in items) { return id; }
    return Object.keys(items).find((key) => items[key].includes(id));
  };

  const getIndex = (id: string) => {
    const container = findContainer(id);
    if (!container) { return -1; }
    const index = items[container].indexOf(id);
    return index;
  };

  const onDragCancel = () => {
    if(clonedItems)
      setItems(clonedItems)
    setActiveId(null)
    setClonedItems(null)
  }

  const onDragEnd = ({ active, over }) => {
    const activeContainer = findContainer(active.id);

    if (!activeContainer) {
      setActiveId(null);
      return;
    }

    const overId = over && over.id

    const overContainer = findContainer(overId);

    if (activeContainer && overContainer) {
      const activeIndex = items[activeContainer].indexOf(active.id);
      const overIndex = items[overContainer].indexOf(overId);

      if (activeIndex !== overIndex) {
        setItems((items) => ({
          ...items,
          [overContainer]: arrayMove(
            items[overContainer],
            activeIndex,
            overIndex
          ),
        }));
      }
    }

    setActiveId(null);
  }

  const onDragOver = ({active, over}) => {
    const overId = over && over.id;

    if (!overId) {
      return;
    }

    const overContainer = findContainer(overId);
    const activeContainer = findContainer(active.id);

    if (!overContainer || !activeContainer) {
      return;
    }

    if (activeContainer !== overContainer) {
      setItems((items) => {
        const activeItems = items[activeContainer];
        const overItems = items[overContainer];
        const overIndex = overItems.indexOf(overId);
        const activeIndex = activeItems.indexOf(active.id);

        let newIndex: number;

        if (overId in items) {
          newIndex = overItems.length + 1;
        } else {
          const isBelowLastItem =
            over &&
            overIndex === overItems.length - 1 &&
            active.rect.current.translated &&
            active.rect.current.translated.offsetTop >
              over.rect.offsetTop + over.rect.height;

          const modifier = isBelowLastItem ? 1 : 0;

          newIndex =
            overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
        }

        return {
          ...items,
          [activeContainer]: [
            ...items[activeContainer].filter((item) => item !== active.id),
          ],
          [overContainer]: [
            ...items[overContainer].slice(0, newIndex),
            items[activeContainer][activeIndex],
            ...items[overContainer].slice(
              newIndex,
              items[overContainer].length
            ),
          ],
        };
      });
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={({active}) => {
        setActiveId(active.id);
        setClonedItems(items);
      }}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      // cancelDrop={CancelDrop}
      onDragCancel={onDragCancel}
      // modifiers={modifiers}
    >
      <div
        style={{
          display: 'inline-grid',
          boxSizing: 'border-box',
          padding: '0px 20px',
          gridAutoFlow: 'row',
        }}
      >
        {Object.keys(items)
          .map((containerId) => (
            <SortableContext
              key={containerId}
              items={items[containerId]}
              strategy={verticalListSortingStrategy}
            >
              <DroppableContainer
                id={containerId}
                items={items[containerId]}
                getStyle={getContainerStyle}
              >
                {items[containerId].map((value, index) => {
                  return (
                    <SortableItem
                      key={value}
                      id={value}
                      index={index}
                      handle={false}
                      style={getItemStyles}
                      wrapperStyle={wrapperStyle}
                      renderItem={null}
                      containerId={containerId}
                      getIndex={getIndex}
                    />
                  );
                })}
              </DroppableContainer>
            </SortableContext>
          ))}
      </div>
      {createPortal(
        <DragOverlay
          adjustScale={false}
          dropAnimation={dropAnimation}
        >
          {activeId ? (
            <Item
              value={activeId}
              handle={false}
              style={getItemStyles({
                containerId: findContainer(activeId),
                overIndex: -1,
                index: getIndex(activeId),
                value: activeId,
                isSorting: activeId !== null,
                isDragging: true,
                isDragOverlay: true,
              })}
              color={getColor(activeId)}
              wrapperStyle={wrapperStyle({index: 0})}
              renderItem={null}
              dragOverlay
            />
          ) : null}
        </DragOverlay>,
        document.body
      )}
    </DndContext>
  );
}

function DroppableContainer({
  children,
  columns = 1,
  id,
  items,
  getStyle = () => ({}),
}) {
  const {over, isOver, setNodeRef} = useDroppable({ id });
  const isOverContainer = isOver || (over ? items.includes(over.id) : false);

  return (
    <List
      ref={setNodeRef}
      style={getStyle({isOverContainer})}
      columns={columns}
    >
      {children}
    </List>
  );
}

const getContainerStyle = ({
  isOverContainer,
}) => ({
  marginTop: 40,
  backgroundColor: isOverContainer
    ? 'rgb(235,235,235,1)'
    : 'rgba(246,246,246,1)',
});

function SortableItem({
  id,
  index,
  handle,
  renderItem,
  style,
  containerId,
  getIndex,
  wrapperStyle,
}) {
  const {
    setNodeRef,
    listeners,
    isDragging,
    isSorting,
    over,
    overIndex,
    transform,
    transition,
  } = useSortable({
    id,
  });
  const mounted = useMountStatus();
  const mountedWhileDragging = isDragging && !mounted;

  return (
    <Item
      ref={setNodeRef}
      value={id}
      dragging={isDragging}
      sorting={isSorting}
      handle={handle}
      index={index}
      wrapperStyle={wrapperStyle({index})}
      style={style({
        index,
        value: id,
        isDragging,
        isSorting,
        overIndex: over ? getIndex(over.id) : overIndex,
        containerId,
      })}
      color={getColor(id)}
      transition={transition}
      transform={transform}
      fadeIn={mountedWhileDragging}
      listeners={listeners}
      renderItem={renderItem}
    />
  );
}

const getItemStyles = () => ({})
const wrapperStyle = () => ({})

const dropAnimation = {
  ...defaultDropAnimation,
  dragSourceOpacity: 0.5,
};

function getColor(id: string) {
  switch (id[0]) {
    case 'A':
      return '#7193f1';
    case 'B':
      return '#ffda6c';
    case 'C':
      return '#00bcd4';
    case 'D':
      return '#ef769f';
  }

  return undefined;
}

function useMountStatus() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setIsMounted(true), 500);

    return () => clearTimeout(timeout);
  }, []);

  return isMounted;
}
