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

// export default {
//   title: 'Presets/Sortable/Multiple Containers',
// };

function DroppableContainer({
  children,
  columns = 1,
  id,
  items,
  getStyle = () => ({}),
}: {
  children: React.ReactNode;
  columns?: number;
  id: string;
  items: string[];
  getStyle: ({
    isOverContainer,
  }: {
    isOverContainer: boolean;
  }) => React.CSSProperties;
}) {
  const {over, isOver, setNodeRef} = useDroppable({
    id,
  });
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

export const defaultContainerStyle = ({
  isOverContainer,
}: {
  isOverContainer: boolean;
}) => ({
  marginTop: 40,
  backgroundColor: isOverContainer
    ? 'rgb(235,235,235,1)'
    : 'rgba(246,246,246,1)',
});

const dropAnimation: DropAnimation = {
  ...defaultDropAnimation,
  dragSourceOpacity: 0.5,
};

type Items = Record<string, string[]>;

interface Props {
  adjustScale?: boolean;
  cancelDrop?: CancelDrop;
  collisionDetection?: CollisionDetection;
  columns?: number;
  getItemStyles?(args: {
    value: UniqueIdentifier;
    index: number;
    overIndex: number;
    isDragging: boolean;
    containerId: UniqueIdentifier;
    isSorting: boolean;
    isDragOverlay: boolean;
  }): React.CSSProperties;
  wrapperStyle?(args: {index: number}): React.CSSProperties;
  getContainerStyle?(args: {isOverContainer: boolean}): React.CSSProperties;
  itemCount?: number;
  items?: Items;
  handle?: boolean;
  renderItem?: any;
  strategy?: SortingStrategy;
  modifiers?: Modifiers;
  trashable?: boolean;
  vertical?: boolean;
}

export default () => (
  <MultipleContainers/>
)

export function MultipleContainers({
  adjustScale = false,
  itemCount = 3,
  cancelDrop,
  collisionDetection = closestCorners,
  columns,
  handle = false,
  items: initialItems,
  getItemStyles = () => ({}),
  getContainerStyle = defaultContainerStyle,
  wrapperStyle = () => ({}),
  modifiers,
  renderItem,
  strategy = verticalListSortingStrategy,
  trashable = false,
  vertical = false,
}: Props) {
  var numberLabels = (num, label) =>
    createRange(num, (index) => `${label}${index + 1}`)

  const [items, setItems] = useState<Items>(
    () =>
      initialItems ?? {
        A: numberLabels(itemCount, 'A'),
        B: numberLabels(itemCount, 'B'),
        C: numberLabels(itemCount, 'C'),
        D: numberLabels(itemCount, 'D'),
      }
  );
  const [clonedItems, setClonedItems] = useState<Items | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  const findContainer = (id: string) => {
    if (id in items) {
      return id;
    }

    return Object.keys(items).find((key) => items[key].includes(id));
  };

  const getIndex = (id: string) => {
    const container = findContainer(id);

    if (!container) {
      return -1;
    }

    const index = items[container].indexOf(id);

    return index;
  };

  const onDragCancel = () => {
    if (clonedItems) {
      // Reset items to their original state in case items have been
      // Dragged across containrs
      setItems(clonedItems);
    }

    setActiveId(null);
    setClonedItems(null);
  };

  const onDragEnd = ({active, over}) => {
    const activeContainer = findContainer(active.id);

    if (!activeContainer) {
      setActiveId(null);
      return;
    }

    const overId = over?.id

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
    const overId = over?.id;

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
      collisionDetection={collisionDetection}
      onDragStart={({active}) => {
        setActiveId(active.id);
        setClonedItems(items);
      }}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      cancelDrop={cancelDrop}
      onDragCancel={onDragCancel}
      modifiers={modifiers}
    >
      <div
        style={{
          display: 'inline-grid',
          boxSizing: 'border-box',
          padding: '0px 20px',
          gridAutoFlow: vertical ? 'row' : 'column',
        }}
      >
        {Object.keys(items)
          .map((containerId) => (
            <SortableContext
              key={containerId}
              items={items[containerId]}
              strategy={strategy}
            >
              <DroppableContainer
                id={containerId}
                columns={columns}
                items={items[containerId]}
                getStyle={getContainerStyle}
              >
                {items[containerId].map((value, index) => {
                  return (
                    <SortableItem
                      key={value}
                      id={value}
                      index={index}
                      handle={handle}
                      style={getItemStyles}
                      wrapperStyle={wrapperStyle}
                      renderItem={renderItem}
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
        <DragOverlay adjustScale={adjustScale} dropAnimation={dropAnimation}>
          {activeId ? (
            <Item
              value={activeId}
              handle={handle}
              style={getItemStyles({
                containerId: findContainer(activeId) as string,
                overIndex: -1,
                index: getIndex(activeId),
                value: activeId,
                isSorting: activeId !== null,
                isDragging: true,
                isDragOverlay: true,
              })}
              color={getColor(activeId)}
              wrapperStyle={wrapperStyle({index: 0})}
              renderItem={renderItem}
              dragOverlay
            />
          ) : null}
        </DragOverlay>,
        document.body
      )}
    </DndContext>
  );
}

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

interface SortableItemProps {
  containerId: string;
  id: string;
  index: number;
  handle: boolean;
  style(args: any): React.CSSProperties;
  getIndex(id: string): number;
  renderItem(): React.ReactElement;
  wrapperStyle({index}: {index: number}): React.CSSProperties;
}

function SortableItem({
  id,
  index,
  handle,
  renderItem,
  style,
  containerId,
  getIndex,
  wrapperStyle,
}: SortableItemProps) {
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

function useMountStatus() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setIsMounted(true), 500);

    return () => clearTimeout(timeout);
  }, []);

  return isMounted;
}
