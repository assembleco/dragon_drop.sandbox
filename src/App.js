import logo from './logo.svg';

import React from "react"
import styled from "styled-components"
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'

class App extends React.Component {
  state = {
    cards: [
      "a",
      "b",
      "c",
      "d",
      "e",
      "f",
    ],
  }

  swapFromTo(begin, end) {
    var cards = this.state.cards

    if(begin < end)
      this.setState({ cards:
        cards.slice(0, begin)
        .concat(cards.slice(begin + 1, end + 1))
        .concat(cards[begin])
        .concat(cards.slice(end + 1, cards.length))
      })
    else if(end < begin)
      this.setState({ cards:
        cards.slice(0, end)
        .concat(cards[begin])
        .concat(cards.slice(end, begin))
        .concat(cards.slice(begin + 1, cards.length))
      })
  }

  render = () => (
    <DragDropContext
      onDragEnd={(drop) => this.swapFromTo(drop.source.index, drop.destination.index)}
    >

      <div>

        <Droppable
          droppableId="droppable-phase"
          type="PHASE"
          direction="horizontal"
        >
        {(provided, snapshot) => (
          <Container
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {provided.placeholder}

          {this.state.cards.map((card, i) => (
            <Draggable draggableId={`draggable-phase-${i}`} index={i}>
              {(provided, snapshot) => (
                <Card
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                >
                  {card}
                </Card>
              )}
            </Draggable>
          ))}

          </Container>
        )}
        </Droppable>

      </div>
    </DragDropContext>
  )
}

var Container = styled.div`
`

var Card = styled.div`
`

export default App;
