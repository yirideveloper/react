const COMMAND = 'menu.main'

const process = (context, action) => {
  const menu = {
    name: 'main',
    commands: [
      {key: 'r', name: 'redux', commands: [{type: 'menu.redux'}]},
      {key: 'c', name: 'clear', commands: []},
      {key: '-', name: 'score', commands: []},
      {key: '.', name: 'repeat', commands: []},
      // {key: 'd', name: 'dev menu', commands: [{type: 'menu.devMenu'}]},
      {key: 'q', name: 'quit', commands: [{type: 'program.die'}]}
    ]
  }

  context.post({type: 'menu.push', menu})
}

export default {
  name: COMMAND,
  process
}
