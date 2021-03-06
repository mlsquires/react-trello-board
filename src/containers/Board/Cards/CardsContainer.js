import React, { Component, PropTypes } from 'react'
import { DropTarget, DragSource } from 'react-dnd'
import { connect } from 'react-redux'
import { RIEInput } from 'riek'
import { Button, Popup, Header, Divider } from 'semantic-ui-react'

import { ListActions } from '../../../redux/lists'
import Cards from './Cards'
import { cardsByListSelector } from '../../../redux'

class CardsContainer extends Component {
  static propTypes = {
    connectDropTarget: PropTypes.func.isRequired,
    connectDragSource: PropTypes.func.isRequired,
    item: PropTypes.object,
    x: PropTypes.number,
    moveCard: PropTypes.func.isRequired,
    moveList: PropTypes.func.isRequired,
    isDragging: PropTypes.bool,
    startScrolling: PropTypes.func,
    stopScrolling: PropTypes.func,
    isScrolling: PropTypes.bool,
    addCard: PropTypes.func,
    setListName: PropTypes.func,
    cards: PropTypes.array,
    deleteList: PropTypes.func
  }

  constructor(props) {
    super(props)
    this.onAddClicked = this.onAddClicked.bind(this)
    this.onListTitleChange = this.onListTitleChange.bind(this)
    this.onDeleteList = this.onDeleteList.bind(this)
  }

  onAddClicked() {
    this.props.addCard(this.props.x)
  }

  onListTitleChange(update) {
    this.props.setListName(this.props.item.id, update.name)
  }

  onDeleteList() {
    this.props.deleteList(this.props.item.id)
  }

  render() {
    const {
      connectDropTarget,
      connectDragSource,
      item,
      x,
      moveCard,
      isDragging,
      cards
    } = this.props
    const opacity = isDragging ? 0.5 : 1

    return connectDragSource(
      connectDropTarget(
        <div className="desk-container">
          <div className="desk" style={{ opacity }}>
            <div className="desk-head">
              <div className="desk-name">
                <RIEInput
                  propName="name"
                  value={item.name}
                  change={this.onListTitleChange}
                  className="desk-name-base"
                  classEditing="desk-name-editing"
                />
              </div>
              <div>
                <Popup
                  trigger={
                    <Button
                      icon="ellipsis vertical"
                      className="list-menu-button"
                      size="mini"
                    />
                  }
                  on="click"
                  position="right-center"
                  basic
                >
                  <div className="list-menu">
                    <Header size="small">List Actions</Header>
                    <Divider />
                    <a href="#" onClick={this.onDeleteList}>
                      Delete List
                    </a>
                  </div>
                </Popup>
              </div>
            </div>
            <Cards
              moveCard={moveCard}
              x={x}
              cards={cards}
              startScrolling={this.props.startScrolling}
              stopScrolling={this.props.stopScrolling}
              isScrolling={this.props.isScrolling}
            />
            <a className="add-card" href="#" onClick={this.onAddClicked}>
              Add a card...
            </a>
          </div>
        </div>
      )
    )
  }
}

const listSource = {
  beginDrag(props) {
    return {
      id: props.id,
      x: props.x
    }
  },
  endDrag(props) {
    props.stopScrolling()
  }
}

const listTarget = {
  canDrop() {
    return false
  },
  hover(props, monitor) {
    if (!props.isScrolling) {
      if (window.innerWidth - monitor.getClientOffset().x < 200) {
        props.startScrolling('toRight')
      } else if (monitor.getClientOffset().x < 200) {
        props.startScrolling('toLeft')
      }
    } else {
      if (
        window.innerWidth - monitor.getClientOffset().x > 200 &&
        monitor.getClientOffset().x > 200
      ) {
        props.stopScrolling()
      }
    }
    const { id: listId } = monitor.getItem()
    const { id: nextX } = props
    if (listId !== nextX) {
      props.moveList(listId, props.x)
    }
  }
}

const mapStateToProps = (state, ownProps) => ({
  cards: cardsByListSelector(state)[ownProps.item.id]
})

const mapDispatchToProps = dispatch => ({
  addCard: listId => dispatch(ListActions.addCard(listId, 'New Card')),
  setListName: (listId, newName) =>
    dispatch(ListActions.setListName(listId, newName)),
  deleteList: listId => dispatch(ListActions.deleteList(listId))
})

export default DropTarget('list', listTarget, connectDragSource => ({
  connectDropTarget: connectDragSource.dropTarget()
}))(
  DragSource('list', listSource, (connectDragSource, monitor) => ({
    connectDragSource: connectDragSource.dragSource(),
    isDragging: monitor.isDragging()
  }))(connect(mapStateToProps, mapDispatchToProps)(CardsContainer))
)
