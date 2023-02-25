import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import getCommandComponent from '../Commands'
import TimelineHeader from './TimelineHeader'
import { map, isNil, filter, uniq, flatten } from 'ramda'
import AppStyles from '../Theme/AppStyles'
import Empty from '../Foundation/EmptyState'

const Styles = {
  container: {
    ...AppStyles.Layout.vbox,
    margin: 0,
    flex: 1,
  },
  commands: {
    margin: 0,
    padding: 0,
    overflowY: 'auto',
    overflowX: 'hidden',
  },

  categoryLabel: {
    color: '#606060',
    paddingLeft: 20,
    fontSize: 12,
    paddingTop: 10,
  },

  loadMore: {
    color: '#606060',
    textAlign: 'center',
    padding: 20,
    fontSize: 16,
  },
}

const propertyExist = (r, ...properties) => {
  for (let key of properties) {
    if (r[key]) r = r[key]
    else return false
  }

  return true
}

const matchProperty = (r, regexp, ...properties) => {
  for (let key of properties) {
    if (r[key]) r = r[key]
    else return false
  }

  return r.match && r.match(regexp) !== null
}

const buildTree = (L, previousTree) => {
  if (!previousTree) {
    previousTree = {}
  }

  return L.reduce((tree, c) => {
    if (propertyExist(c, 'type')) {
      if (!tree[c.type]) tree[c.type] = []
      tree[c.type].push(c)
    }

    if (propertyExist(c, 'payload', 'triggerType')) {
      if (!tree[c.payload.triggerType]) tree[c.payload.triggerType] = []
      tree[c.payload.triggerType].push(c)
    }

    if (propertyExist(c, 'payload', 'preview')) {
      if (!tree[c.payload.preview]) tree[c.payload.preview] = []
      tree[c.payload.preview].push(c)
    }

    if (propertyExist(c, 'payload', 'name')) {
      if (!tree[c.payload.name]) tree[c.payload.name] = []
      tree[c.payload.name].push(c)
    }

    return tree
  }, previousTree)
}

const getCommandsFromTree = (tree, regexp) => {
  let keys = Object.keys(tree)
  let commands = {}
  for (let key of keys) {
    if (key.match(regexp)) commands[key] = tree[key]
  }

  return commands
}

const mapl = (cb, L, limit) => {
  if (L.length < limit) return L.map(cb)

  let nL = []
  for (let i = 0; i < limit; i++) {
    nL.push(cb(L[i], i, L))
  }

  return nL
}

@inject('session')
@observer
class Timeline extends Component {
  constructor(props) {
    super(props)
    this.state = {
      inputValue: '',
    }

    this.lastSlice = props.session.commands.length
    this.searchTree = buildTree(props.session.commands)
  }
  // fires when we will update
  componentWillUpdate() {
    const node = this.refs.commands
    // http://blog.vjeux.com/2013/javascript/scroll-position-with-react.html
    // remember our height, position, and if we're at the top
    this.scrollHeight = node.scrollHeight
    this.scrollTop = node.scrollTop
    this.isPinned = this.scrollTop === 0

    let { lastSlice: current } = this,
      { commands: next } = this.props.session

    // No changes, keep tree
    if (current === next.length) {
      return
    }

    const { session } = this.props
    // Command list was reset, rebuild tree
    if (next.length < current && session.isCommandHidden('query.preserve')) {
      this.lastSlice = next.length
      this.searchTree = buildTree(next, {})
      return
    }

    if (this.rebuildDelay) {
      clearTimeout(this.rebuildDelay)
    }

    this.rebuildDelay = setTimeout(() => {
      this.lastSlice = next.length
      this.searchTree = buildTree(next.slice(0, next.length - current), this.searchTree)
      this.forceUpdate()
    }, 200)
  }

  // fires after we did update
  componentDidUpdate() {
    // should we be pinned to top, let's not auto-scroll
    if (this.isPinned) return
    const node = this.refs.commands
    // scroll to the place we were before
    // TODO: this falls apart as we reach max queue size as the scrollHeigh no longer changes
    node.scrollTop = this.scrollTop + node.scrollHeight - this.scrollHeight
  }

  componentWillReceiveProps = nextProps => {}

  renderEmpty() {
    return (
      <Empty icon="reorder" title="No Activity">
        <p>Once your app connects and starts sending events, they will appear here.</p>
      </Empty>
    )
  }

  onFilter = t => {
    if (this.filterDelay) {
      clearTimeout(this.filterDelay)
    }

    this.filterDelay = setTimeout(() => {
      this.setState({
        inputValue: t,
        // currentlyShowing: filter((c) => this.filterCommands(regexp, c), commands),
      })
    }, 300)
  }

  filterCommands = (regexp, c) => {
    return (
      matchProperty(c, regexp, 'type') ||
      matchProperty(c, regexp, 'payload', 'preview') ||
      matchProperty(c, regexp, 'payload', 'name')
    )
  }

  renderItem = command => {
    const CommandComponent = getCommandComponent(command)
    if (isNil(CommandComponent)) return null

    return <CommandComponent key={command.messageId} command={command} />
  }

  renderIgnored = remaining => (
    <div style={Styles.loadMore}>{`... there are ${remaining} older entries.`}</div>
  )

  renderQuery = tree => {
    let regexp = new RegExp(this.state.inputValue.replace(/\s/, '.'), 'i')
    const categories = getCommandsFromTree(tree, regexp)
    const renderAmount = 10
    const timelineAmount = 50

    const { session } = this.props

    const renderTimeline = categories =>
      mapl(
        this.renderItem,
        uniq(flatten(Object.keys(categories).map(key => categories[key]))),
        timelineAmount
      )

    const renderCategories = categories =>
      Object.keys(categories)
        .map(key => [key, categories[key]])
        .sort((c1, c2) => c2[1][0].date - c1[1][0].date)
        .map((c, i) => {
          const key = c[0]
          const commands = c[1]

          const cutCommands = mapl(command => command, commands, renderAmount)
          cutCommands.sort((c1, c2) => c2.date - c1.date)

          return (
            <div key={key}>
              <div style={Styles.categoryLabel}>
                {key} - {commands.length} events
              </div>
              <div>
                {map(this.renderItem, cutCommands)}
                {commands.length > renderAmount
                  ? this.renderIgnored(commands.length - renderAmount)
                  : null}
              </div>
            </div>
          )
        })

    return session.isCommandHidden('query.timeline')
      ? renderCategories(categories)
      : renderTimeline(categories)

    return
  }

  render() {
    // grab the commands, but sdrawkcab
    const commands = this.props.session.commands
    const isEmpty = commands.length === 0

    return (
      <div style={Styles.container}>
        <TimelineHeader onFilter={this.onFilter} />
        {isEmpty && this.renderEmpty()}
        <div style={Styles.commands} ref="commands">
          {this.state.inputValue
            ? this.renderQuery(this.searchTree)
            : map(this.renderItem, commands)}
        </div>
      </div>
    )
  }
}

export default Timeline
