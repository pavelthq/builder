import React from 'react'

export default class FrontendClassicSwitcher extends React.Component {
  constructor (props) {
    super(props)
    const gutenberg = window.VCV_GUTENBERG && window.VCV_GUTENBERG()
    this.enableClassicEditor = this.enableClassicEditor.bind(this)
    this.openFrontendEditor = this.openFrontendEditor.bind(this)
    if (gutenberg) {
      this.enableGutenbergEditor = this.enableGutenbergEditor.bind(this)
    }

    const beEditorInput = document.getElementById('vcv-be-editor')
    let url = window.location.href
    if (url.indexOf('classic-editor') !== -1) {
      beEditorInput.value = 'classic'
    }
    let editor = beEditorInput.value
    if ((beEditorInput && [ 'classic', 'gutenberg' ].indexOf(editor) === -1) || (editor === 'gutenberg' && !gutenberg)) {
      editor = 'be'
      this.hideClassicEditor()
    }

    this.state = {
      editor: editor
    }

    this.wpb = (typeof window.vc !== 'undefined')
  }

  enableClassicEditor (e) {
    e.preventDefault()
    const editor = 'classic'
    const localizations = window.VCV_I18N && window.VCV_I18N()
    const confirmMessage = localizations && localizations.enableClassicEditorConfirmMessage ? localizations.enableClassicEditorConfirmMessage : 'Visual Composer will overwrite your content created in WordPress Classic editor with the latest version of content created in Visual Composer Website Builder. Do you want to continue?'
    if (window.confirm(confirmMessage)) {
      this.setState({ editor: editor })
      this.showClassicEditor()
    }
  }

  enableGutenbergEditor (e) {
    e.preventDefault()
    const editor = 'gutenberg'
    const localizations = window.VCV_I18N && window.VCV_I18N()
    const confirmMessage = localizations && localizations.enableGutenbergEditorConfirmMessage ? localizations.enableGutenbergEditorConfirmMessage : 'Gutenberg will overwrite your content created in Visual Composer Website Builder. Do you want to continue?'
    if (window.confirm(confirmMessage)) {
      this.setState({ editor: editor })
      let url = window.location.href
      url += (url.match(/[?]/g) ? '&' : '?') + 'vcv-set-editor=gutenberg'
      window.location = url
    }
  }

  openFrontendEditor (e) {
    e.preventDefault()
    const localizations = window.VCV_I18N && window.VCV_I18N()
    const confirmMessage = localizations && localizations.openFrontendEditorFromClassic ? localizations.openFrontendEditorFromClassic : 'Visual Composer will overwrite your content created in WordPress Classic editor with the latest version of content created in Visual Composer Website Builder. Do you want to continue?'
    if (this.state.editor === 'be' || window.confirm(confirmMessage)) {
      window.location.href = e.currentTarget.dataset.href
    }
  }

  hideClassicEditor () {
    if (document.getElementById('postdivrich') !== null) {
      document.getElementById('postdivrich').classList.add('vcv-hidden')
    }
  }

  showClassicEditor () {
    var url = window.location.href
    if (url.indexOf('?') > -1) {
      url += '&classic-editor=1'
    } else {
      url += '?classic-editor=1'
    }
    window.location.href = url
  }

  render () {
    const localizations = window.VCV_I18N && window.VCV_I18N()
    const buttonClassictext = localizations && localizations.classicEditor ? localizations.classicEditor : 'Classic Editor'
    const buttonGutenbergtext = localizations && localizations.gutenbergEditor ? localizations.gutenbergEditor : 'Gutenberg Editor'
    const { editor } = this.state
    const gutenberg = window.VCV_GUTENBERG && window.VCV_GUTENBERG()
    if (this.state.editor === 'be' && this.wpb === true) {
      this.showClassicEditor()
    }

    let gutenbergButton = null
    if (gutenberg && editor !== 'gutenberg') {
      gutenbergButton = <div className='vcv-wpbackend-switcher--type-gutenberg as'>
        <button className='vcv-wpbackend-switcher-option' onClick={this.enableGutenbergEditor}>{buttonGutenbergtext}</button>
      </div>
    }

    let output = <div className='vcv-wpbackend-switcher-wrapper'>
      <div className='vcv-wpbackend-switcher'>
        <button className='vcv-wpbackend-switcher-option vcv-wpbackend-switcher-option--vceditor' data-href={window.vcvFrontendEditorLink} onClick={this.openFrontendEditor} />
      </div>
      {editor !== 'classic' && this.wpb === false && !gutenberg ? (() => {
        return <div className='vcv-wpbackend-switcher--type-classic'>
          <button className='vcv-wpbackend-switcher-option'
            onClick={this.enableClassicEditor}>{buttonClassictext}</button>
        </div>
      })() : ''}
      {gutenbergButton}
    </div>
    return output
  }
}
