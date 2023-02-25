import * as React from "react"
import { inject, observer } from "mobx-react"
import { ReactTerminalStateless, ReactThemes, ReactOutputRenderers } from "react-terminal-component"
import { EmulatorState, OutputFactory } from "javascript-terminal"
import ReactotronEmulator from "../../Shared/ReactotronEmulator"
import Session from "../../Stores/SessionStore"
import Colors from "../../Theme/Colors"
import customerRenderers, { renderTypes } from "./renderers"

const Styles = {
  header: {
    WebkitAppRegion: "drag",
    height: "30px",
    width: "100%",
    backgroundColor: Colors.backgroundSubtleLight,
  },
}

interface Props {
  session: Session
}

interface State {
  emulatorState: any
  inputStr: string
  promptSymbol: string
}

function addOutput(state, type, content) {
  return state.setOutputs(
    state.getOutputs().push(
      new OutputFactory.OutputRecord({
        type,
        content,
      })
    )
  )
}

@inject("session")
@observer
export default class ReactotronTerminal extends React.Component<Props, State> {
  state = {
    emulatorState: EmulatorState.createEmpty(),
    inputStr: "",
    promptSymbol: ">",
  }

  emulator: ReactotronEmulator

  constructor(props) {
    super(props)

    this.emulator = new ReactotronEmulator(this.commandHandler)
    this.emulator.setCurrentPrompt(this.state.promptSymbol)
  }

  componentDidMount() {
    this.props.session.ui.replResponseHandler = this.responseHandler

    this.setState({
      emulatorState: addOutput(
        this.state.emulatorState,
        renderTypes.OBJECT_TYPE,
        "All REPLs are available on `this`"
      ),
    })
  }

  commandHandler = (state, commandStrToExecute) => {
    const {
      session: { ui },
    } = this.props

    if (commandStrToExecute === "exit") {
      ui.openTerminal(false)
      return state
    }

    if (!this.props.session.selectedConnection) {
      return addOutput(state, renderTypes.OBJECT_TYPE, "There is no connected device!")
    }

    if (commandStrToExecute === "ls") {
      ui.server.send("repl.ls")
      return state
    }

    if (commandStrToExecute.substr(0, 3) === "cd ") {
      ui.server.send("repl.cd", commandStrToExecute.substr(3))

      const newPrompt = `${commandStrToExecute.substr(3)}>`

      this.setState({
        promptSymbol: newPrompt,
      })
      this.emulator.setCurrentPrompt(newPrompt)
      return state
    }

    ui.server.send("repl.execute", commandStrToExecute)

    return state
  }

  responseHandler = response => {
    let newEmulator = this.state.emulatorState

    switch (response.type) {
      case "repl.ls.response":
        newEmulator = addOutput(newEmulator, renderTypes.LS_TYPE, response.payload)
        break
      case "repl.cd.response":
      case "repl.execute.response":
        newEmulator = addOutput(newEmulator, renderTypes.OBJECT_TYPE, response.payload)
        break
    }

    this.setState({
      emulatorState: newEmulator,
    })
  }

  render() {
    return (
      <div>
        <div style={Styles.header} />
        <ReactTerminalStateless
          altEmulator={this.emulator}
          theme={{ ...ReactThemes.default, background: "rgb(30, 30, 30)", height: "100vh" }}
          emulatorState={this.state.emulatorState}
          inputStr={this.state.inputStr}
          promptSymbol={this.state.promptSymbol}
          onInputChange={inputStr => this.setState({ inputStr })}
          onStateChange={emulatorState => this.setState({ emulatorState, inputStr: "" })}
          outputRenderers={{
            ...ReactOutputRenderers,
            ...customerRenderers,
          }}
        />
      </div>
    )
  }
}
