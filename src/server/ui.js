import blessed from 'blessed'

const screen = blessed.screen({
  smartCSR: true,
  title: 'reactotron',
  dockBorders: false
})

const promptBox = blessed.prompt({
  parent: screen,
  top: 'center',
  left: 'center',
  height: 'shrink',
  width: 'shrink',
  border: 'line',
  label: ' {blue-fg}Prompt{/} ',
  tags: true,
  keys: true,
  mouse: true,
  hidden: true
})

const messageBox = blessed.message({
  parent: screen,
  top: 'center',
  left: 'center',
  height: 'shrink',
  width: 'shrink',
  border: 'line',
  label: ' {blue-fg}Message{/} ',
  tags: true,
  keys: true,
  mouse: true,
  hidden: true
})

const logBox = blessed.log({
  parent: screen,
  scrollable: true,
  left: 0,
  top: 0,
  width: '33%',
  height: '100%-1',
  border: 'line',
  tags: true,
  keys: true,
  vi: true,
  mouse: true,
  scrollback: 400,
  label: ' {white-fg}Log{/} ',
  scrollbar: {
    ch: ' ',
    inverse: true
  }
})

const reduxContainer = blessed.box({
  parent: screen,
  left: 'center',
  width: '33%',
  top: 0,
  height: '100%-1'
})

const reduxActionBox = blessed.log({
  parent: reduxContainer,
  scrollable: true,
  left: '0',
  top: 0,
  height: '50%',
  width: '100%',
  border: 'line',
  tags: true,
  keys: true,
  vi: true,
  mouse: true,
  label: ' {white-fg}Redux Actions{/} ',
  scrollbar: {
    ch: ' ',
    inverse: true
  }
})

const reduxWatchBox = blessed.log({
  parent: reduxContainer,
  scrollable: true,
  left: 0,
  width: '100%',
  bottom: 0,
  height: '50%',
  border: 'line',
  tags: true,
  keys: false,
  vi: false,
  mouse: true,
  label: ' {white-fg}Redux Subscriptions{/}',
  scrollbar: {
    ch: ' ',
    inverse: true
  }
})

const apiBox = blessed.log({
  parent: screen,
  scrollable: true,
  right: 0,
  top: 0,
  height: '100%-1',
  width: '33%',
  border: 'line',
  tags: true,
  keys: true,
  vi: true,
  mouse: true,
  scrollback: 400,
  label: ' {white-fg}Api{/} ',
  scrollbar: {
    ch: ' ',
    inverse: true
  }
})

const statusBox = blessed.box({
  parent: screen,
  bottom: 0,
  height: 1,
  left: 0,
  right: 0,
  width: '100%',
  tags: true
})

const instructionsBox = blessed.box({
  parent: statusBox,
  left: 0,
  top: 0,
  height: '100%',
  width: '100%',
  tags: true
})

blessed.box({
  parent: statusBox,
  width: 'shrink',
  height: '100%',
  left: 0,
  top: 0,
  tags: true,
  content: '{yellow-fg}reactotron{/}'
})

const OFFLINE = '{right}{black-bg}{red-fg}Offline{/}{/}{/}'
const ONLINE = '{right}{black-bg}{green-fg}Online{/}{/}{/}'

const connectionBox = blessed.box({
  parent: statusBox,
  top: 0,
  right: 0,
  height: '100%',
  width: 'shrink',
  content: OFFLINE,
  tags: true
})

export default {
  screen,
  connectionBox,
  promptBox,
  messageBox,
  logBox,
  reduxActionBox,
  reduxWatchBox,
  apiBox,
  instructionsBox,
  statusBox,
  OFFLINE,
  ONLINE
}
