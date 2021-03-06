import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { DragDropContext } from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'

import { ListActions } from '../../redux/lists'

import CardsContainer from './Cards/CardsContainer'
import CustomDragLayer from './CustomDragLayer'
import CardModal from '../EditCard/CardModal'
import NewListPlaceholder from './NewListPlaceholder'

class Board extends Component {
  static propTypes = {
    moveCard: PropTypes.func.isRequired,
    moveList: PropTypes.func.isRequired,
    lists: PropTypes.array.isRequired,
    addList: PropTypes.func.isRequired
  }

  constructor(props) {
    super(props)
    this.moveCard = this.moveCard.bind(this)
    this.moveList = this.moveList.bind(this)
    this.findList = this.findList.bind(this)
    this.scrollRight = this.scrollRight.bind(this)
    this.scrollLeft = this.scrollLeft.bind(this)
    this.stopScrolling = this.stopScrolling.bind(this)
    this.startScrolling = this.startScrolling.bind(this)
    this.state = { isScrolling: false }
  }

  startScrolling(direction) {
    // if (!this.state.isScrolling) {
    switch (direction) {
      case 'toLeft':
        this.setState({ isScrolling: true }, this.scrollLeft())
        break
      case 'toRight':
        this.setState({ isScrolling: true }, this.scrollRight())
        break
      default:
        break
    }
    // }
  }

  scrollRight() {
    function scroll() {
      document.getElementsByTagName('main')[0].scrollLeft += 10
    }
    this.scrollInterval = setInterval(scroll, 10)
  }

  scrollLeft() {
    function scroll() {
      document.getElementsByTagName('main')[0].scrollLeft -= 10
    }
    this.scrollInterval = setInterval(scroll, 10)
  }

  stopScrolling() {
    this.setState({ isScrolling: false }, clearInterval(this.scrollInterval))
  }

  moveCard(lastX, lastY, nextX, nextY) {
    this.props.moveCard(lastX, lastY, nextX, nextY)
  }

  moveList(listId, nextX) {
    const { lastX } = this.findList(listId)
    this.props.moveList(lastX, nextX)
  }

  findList(id) {
    const { lists } = this.props
    const list = lists.filter(l => l.id === id)[0]

    return {
      list,
      lastX: lists.indexOf(list)
    }
  }

  render() {
    const { lists } = this.props

    return (
      <div className="board">
        <div className="board-inner">
          <CardModal />
          <CustomDragLayer snapToGrid={false} />
          {lists.map((item, i) =>
            <CardsContainer
              key={item.id}
              id={item.id}
              item={item}
              moveCard={this.moveCard}
              moveList={this.moveList}
              startScrolling={this.startScrolling}
              stopScrolling={this.stopScrolling}
              isScrolling={this.state.isScrolling}
              x={i}
            />
          )}
          <NewListPlaceholder onAddList={this.props.addList} />
        </div>
      </div>
    )
  }
}

const mapStateToProps = state => ({
  lists: state.lists.lists
})

const mapDispatchToProps = dispatch => ({
  moveCard: (lastX, lastY, nextX, nextY) =>
    dispatch(ListActions.moveCard(lastX, lastY, nextX, nextY)),
  moveList: (lastX, nextX) => dispatch(ListActions.moveList(lastX, nextX)),
  addList: () => dispatch(ListActions.addList())
})
// bindActionCreators(ListsActions, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(
  DragDropContext(HTML5Backend)(Board)
)
