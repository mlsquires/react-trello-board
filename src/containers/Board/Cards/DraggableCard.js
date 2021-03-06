import React, { Component, PropTypes } from 'react'
import { findDOMNode } from 'react-dom'
import { DragSource } from 'react-dnd'
import { getEmptyImage } from 'react-dnd-html5-backend'
import sizeMe from 'react-sizeme'

import Card from './Card'

const getStyles = isDragging => ({
  display: isDragging ? 0.5 : 1
})

class CardComponent extends Component {
  static propTypes = {
    item: PropTypes.object,
    connectDragSource: PropTypes.func.isRequired,
    connectDragPreview: PropTypes.func.isRequired,
    isDragging: PropTypes.bool.isRequired,
    x: PropTypes.number.isRequired,
    y: PropTypes.number,
    stopScrolling: PropTypes.func
  }

  componentDidMount() {
    this.props.connectDragPreview(getEmptyImage(), {
      captureDraggingState: true
    })
  }

  render() {
    const { isDragging, connectDragSource, item } = this.props

    return connectDragSource(
      <div>
        <Card style={getStyles(isDragging)} item={item} />
      </div>
    )
  }
}

const cardSource = {
  beginDrag: (props, monitor, component) => {
    // dispatch to redux store that drag is started
    const { item, x, y } = props
    const { id, title } = item
    const { clientWidth, clientHeight } = findDOMNode(component)

    return { id, title, item, x, y, clientWidth, clientHeight }
  },
  endDrag: (props, monitor) => {
    document.getElementById(monitor.getItem().id).style.display = 'block'
    props.stopScrolling()
  },
  isDragging: (props, monitor) => {
    const isDragging = props.item && props.item.id === monitor.getItem().id
    return isDragging
  }
}

// options: 4rd param to DragSource https://gaearon.github.io/react-dnd/docs-drag-source.html
const OPTIONS = {
  arePropsEqual: (props, otherProps) => {
    let isEqual = true
    if (
      props.item.id === otherProps.item.id &&
      props.x === otherProps.x &&
      props.y === otherProps.y
    ) {
      isEqual = true
    } else {
      isEqual = false
    }
    return isEqual
  }
}

const collectDragSource = (connectDragSource, monitor) => ({
  connectDragSource: connectDragSource.dragSource(),
  connectDragPreview: connectDragSource.dragPreview(),
  isDragging: monitor.isDragging()
})

export default sizeMe({ monitorWidth: false, monitorHeight: true })(
  DragSource('card', cardSource, collectDragSource, OPTIONS)(CardComponent)
)
