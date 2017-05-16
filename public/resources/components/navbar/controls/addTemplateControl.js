import React from 'react'
import classNames from 'classnames'
import {getStorage} from 'vc-cake'
import NavbarContent from '../navbarContent'
const workspaceSettings = getStorage('workspace').state('settings')
const workspaceContentEndState = getStorage('workspace').state('contentEnd')

export default class AddTemplateControl extends NavbarContent {

  constructor (props) {
    super(props)
    this.state = {
      isActive: false
    }
    this.toggleAddTemplate = this.toggleAddTemplate.bind(this)
    this.setActiveState = this.setActiveState.bind(this)
  }

  componentDidMount () {
    workspaceContentEndState.onChange(this.setActiveState)
  }

  componentWillUnmount () {
    workspaceContentEndState.ignoreChange(this.setActiveState)
  }

  setActiveState (state) {
    this.setState({ isActive: state === 'addTemplate' })
  }

  toggleAddTemplate (e) {
    e && e.preventDefault()
    const settings = this.state.isActive ? false : {
      action: 'addTemplate',
      element: {},
      tag: '',
      options: {}
    }
    workspaceSettings.set(settings)
  }

  render () {
    const localizations = window.VCV_I18N && window.VCV_I18N()
    const name = localizations ? localizations.addTemplate : 'Add Template'

    let controlClass = classNames({
      'vcv-ui-navbar-control': true,
      'vcv-ui-state--active': this.state.isActive
    })

    return (
      <a
        className={controlClass}
        onClick={this.toggleAddTemplate}
        href='#'
        title={name}
      >
        <span className='vcv-ui-navbar-control-content'>
          <i className='vcv-ui-navbar-control-icon vcv-ui-icon vcv-ui-icon-template' />
          <span>{name}</span>
        </span>
      </a>
    )
  }
}
