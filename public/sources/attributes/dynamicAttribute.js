import React from 'react'
import classNames from 'classnames'
import Autocomplete from './autocomplete/Component'
import Dropdown from './dropdown/Component'
import Toggle from './toggle/Component'
import { env, getService, getStorage } from 'vc-cake'

const settingsStorage = getStorage('settings')
const { getBlockRegexp, parseDynamicBlock } = getService('utils')
const blockRegexp = getBlockRegexp()

export default class DynamicAttribute extends React.Component {
  static localizations = window.VCV_I18N && window.VCV_I18N()

  constructor (props) {
    super(props)

    this.handleChangeSourceId = this.handleChangeSourceId.bind(this)
    this.handleDynamicFieldOpen = this.handleDynamicFieldOpen.bind(this)
    this.handleDynamicFieldClose = this.handleDynamicFieldClose.bind(this)
    this.handleDynamicFieldChange = this.handleDynamicFieldChange.bind(this)
    this.handleAutocompleteToggle = this.handleAutocompleteToggle.bind(this)
    this.onLoadPostFields = this.onLoadPostFields.bind(this)

    const isDynamic = env('VCV_JS_FT_DYNAMIC_FIELDS') && this.props.options && this.props.options.dynamicField
    let state = {
      isDynamic: isDynamic
    }

    if (isDynamic) {
      let newState = this.getStateFromValue(this.props.value)
      window.setTimeout(() => {
        settingsStorage.trigger('loadDynamicPost', state.sourceId, this.onLoadPostFields, function (error) {
          console.warn('Error loading dynamic post info', error)
          this.onLoadPostFields(this.state.sourceId, {}, {})
        })
      }, 1)
      state = { ...state, ...newState }
    }
    this.state = state
  }

  componentDidUpdate (prevProps, prevState) {
    if (!this.state.isDynamic) {
      return
    }
    if (prevState.dynamicFieldOpened !== this.state.dynamicFieldOpened) {
      return
    }
    // If value is changed from outside (ex. Design Options Custom Devices)
    let newValue = window.decodeURIComponent(this.props.value)
    let oldValue = window.decodeURIComponent(prevProps.value)
    let newSourceId = null
    if (newValue && typeof newValue === 'string' && newValue.match(blockRegexp)) {
      const blockInfo = parseDynamicBlock(newValue)
      if (blockInfo) {
        newSourceId = blockInfo.blockAtts && blockInfo.blockAtts.sourceId
        newValue = newValue.replace(blockInfo.beforeBlock, '').replace(blockInfo.afterBlock, '')
      }
    }
    if (oldValue && typeof oldValue === 'string' && oldValue.match(blockRegexp)) {
      const blockInfo = parseDynamicBlock(oldValue)
      if (blockInfo) {
        oldValue = oldValue.replace(blockInfo.beforeBlock, '').replace(blockInfo.afterBlock, '')
      }
    }

    if (oldValue !== newValue) {
      let dataLoaded = true
      let postFields = this.state.postFields
      let oldSourceId = this.state.blockInfo && this.state.blockInfo.blockAtts.sourceId
      if (newSourceId && (newSourceId !== oldSourceId)) {
        dataLoaded = false
        postFields = {}
      }
      let newState = this.getStateFromValue(newValue, dataLoaded, postFields, newSourceId !== oldSourceId)
      if (!dataLoaded) {
        window.setTimeout(() => {
          settingsStorage.trigger('loadDynamicPost', this.state.sourceId, this.onLoadPostFields, function (error) {
            console.warn('Error loading dynamic post info', error)
            this.onLoadPostFields(this.state.sourceId, {}, {})
          })
        }, 1)
      }
      this.setState(newState)
    }
  }

  getStateFromValue (value, dataLoaded = false, postFields = {}, updateAutocompleteToggle = true) {
    let state = {}
    const postData = settingsStorage.state('postData').get()
    let sourceId = postData.post_id
    state.dynamicFieldOpened = false
    state.blockInfo = false // Default value is false if not matched
    state.showAutocomplete = false
    if (typeof value === 'string' && value.match(blockRegexp)) {
      state.dynamicFieldOpened = true
      const blockInfo = parseDynamicBlock(value)
      if (blockInfo && blockInfo.blockAtts) {
        if (blockInfo.blockAtts.sourceId) {
          // If sourceId explicitly set, then we expect that custom toggle is ON
          state.showAutocomplete = true
        }
        sourceId = blockInfo.blockAtts.sourceId || window.vcvSourceID
        state.blockInfo = blockInfo
      }
    }
    state.sourceId = parseInt(sourceId, 10)
    state.dataLoaded = dataLoaded
    state.postFields = postFields

    return state
  }

  onLoadPostFields (sourceId, postData, postFields) {
    if (this.state.sourceId === sourceId) {
      this.setState({
        dataLoaded: true,
        postFields: postFields || {}
      }, () => {
        // Update attribute value with new sourceId
        if (this.state.blockInfo && this.state.blockInfo.blockAtts.value) {
          this.handleDynamicFieldChange(undefined, this.state.blockInfo.blockAtts.value)
        }
      })
    }
  }

  handleChangeSourceId (_, value) {
    if (value && value.trim().match(/^\d+$/)) {
      // Value is number, so we can try to set it
      const sourceId = parseInt(value, 10)
      let state = {}
      state.sourceId = sourceId
      state.dataLoaded = false
      state.postFields = {}
      window.setTimeout(() => {
        settingsStorage.trigger('loadDynamicPost', sourceId, this.onLoadPostFields, function (error) {
          console.warn('Error loading dynamic post info', error)
          this.onLoadPostFields(this.state.sourceId, {}, {})
        })
      }, 1)
      this.setState(state)
    } else {
      // We have wrong post at all :/
      this.setState({ postFields: {} })
    }
  }

  handleDynamicFieldChange (_, dynamicFieldKey) {
    let newValue = this.props.handleDynamicFieldChange(dynamicFieldKey, this.state.sourceId, this.state.showAutocomplete)
    let fieldValue = newValue
    let dynamicValue = newValue

    if (newValue.fieldValue && newValue.dynamicValue) {
      fieldValue = newValue.fieldValue
      dynamicValue = newValue.dynamicValue
    }

    let blockInfo = parseDynamicBlock(dynamicValue)
    this.setState({ blockInfo: blockInfo })
    this.props.setFieldValue(fieldValue)
  }

  handleDynamicFieldOpen (e) {
    e && e.preventDefault()
    this.setState({
      dynamicFieldOpened: true,
      prevValue: this.props.value
    })
    if (this.state.blockInfo && this.state.blockInfo.value) {
      this.props.setFieldValue(this.state.blockInfo.value)
    }
    this.props.onOpen && this.props.onOpen(this)
  }

  handleDynamicFieldClose (e) {
    e && e.preventDefault()
    if (this.state.prevValue) {
      this.props.setFieldValue(this.state.prevValue)
    } else if (this.props.defaultValue !== undefined) {
      this.props.setFieldValue(this.props.defaultValue)
    }
    this.setState({ dynamicFieldOpened: false })
    this.props.onClose && this.props.onClose(this)
  }

  renderOpenButton () {
    return <span className='vcv-ui-icon vcv-ui-icon-plug vcv-ui-dynamic-field-control' onClick={this.handleDynamicFieldOpen} title={DynamicAttribute.localizations.dynamicFieldsOpenText || 'Replace static content with Dynamic Field'} />
  }

  renderCloseButton () {
    return <span className='vcv-ui-icon vcv-ui-icon-close vcv-ui-dynamic-field-control' onClick={this.handleDynamicFieldClose} title={DynamicAttribute.localizations.dynamicFieldsCloseText || 'Close Dynamic Field'} />
  }

  renderAutoCompleteInput () {
    return <Autocomplete
      value={this.state.sourceId + ''} // force string
      elementAccessPoint={this.props.elementAccessPoint}
      fieldKey={`${this.props.fieldKey}-dynamic-source-autocomplete`}
      key={`${this.props.fieldKey}-dynamic-source-autocomplete-${this.state.sourceId + ''}`}
      options={{
        // values: fieldList
        single: true,
        action: 'dynamicPosts',
        labelAction: '',
        validation: true
      }}
      updater={this.handleChangeSourceId}
      extraClass='vcv-ui-form-field-dynamic'
      description={DynamicAttribute.localizations.dynamicAutocompleteDescription || 'Select the page, post, or custom post type (current post is selected by default).'}
    />
  }

  renderAutocompleteToggle () {
    return <React.Fragment>
      <Toggle
        value={this.state.showAutocomplete}
        elementAccessPoint={this.props.elementAccessPoint}
        fieldKey={`${this.props.fieldKey}-dynamic-source-autocomplete`}
        key={`${this.props.fieldKey}-dynamic-source-autocomplete-toggle-${this.state.sourceId + ''}`}
        options={{ labelText: DynamicAttribute.localizations.dynamicAutocompleteToggleLabel || 'Set custom post source' }}
        updater={this.handleAutocompleteToggle}
        extraClass='vcv-ui-form-field-dynamic'
      />
      <p className='vcv-ui-form-helper'>{DynamicAttribute.localizations.dynamicAutocompleteToggleDescription || 'By default, dynamic content will be taken from the current post.'}</p>
    </React.Fragment>
  }

  renderDynamicFieldsDropdown (fieldsList) {
    let newFieldsList = Object.values(fieldsList)
    newFieldsList.unshift({ label: 'Select your value', value: '', disabled: true })
    return (
      <Dropdown
        value={this.state.blockInfo ? this.state.blockInfo.blockAtts.value.replace(/^(.+)(::)(.+)$/, '$1$2') : ''}
        fieldKey={`${this.props.fieldKey}-dynamic-dropdown`}
        options={{
          values: newFieldsList
        }}
        updater={this.handleDynamicFieldChange}
        extraClass='vcv-ui-form-field-dynamic'
        description={DynamicAttribute.localizations.dynamicTypeDescription || 'Select the dynamic content data source.'}
      />
    )
  }

  handleAutocompleteToggle (_, value) {
    if (!value && (this.state.sourceId !== window.vcvSourceID)) {
      // Return back current source ID
      this.handleChangeSourceId(_, window.vcvSourceID + '') // force string + change id
    }
    this.setState({
      showAutocomplete: value
    }, () => {
      this.handleChangeSourceId(_, this.state.sourceId + '') // Re-trigger change to explicitly save the ID
    })
  }

  renderDynamicFieldsExtra () {
    let extraDynamicComponent = null
    if (this.state.blockInfo && this.state.blockInfo.blockAtts.value.match(/::/)) {
      const [ dynamicFieldKey, extraKey ] = this.state.blockInfo.blockAtts.value.split('::')
      const updateExtraKey = (e) => {
        e && e.preventDefault()
        const extraDynamicFieldKey = e.currentTarget && e.currentTarget.value
        const dynamicFieldKeyFull = `${dynamicFieldKey}::${extraDynamicFieldKey}`
        this.handleDynamicFieldChange(null, dynamicFieldKeyFull)
      }
      const extraDynamicFieldClassNames = classNames({
        'vcv-ui-form-input': true,
        'vcv-ui-form-field-dynamic': true,
        'vcv-ui-form-field-dynamic-extra': true
      })
      extraDynamicComponent =
        <input type='text' className={extraDynamicFieldClassNames} onChange={updateExtraKey} value={extraKey} placeholder='Enter valid meta key' />
    }

    return extraDynamicComponent
  }

  renderDynamicInputs () {
    let autoCompleteComponent = this.state.showAutocomplete ? this.renderAutoCompleteInput() : null

    let loader = null
    let fieldComponent = null
    let extraDynamicComponent = null
    if (!this.state.dataLoaded) {
      loader = <span className='vcv-ui-icon vcv-ui-wp-spinner' />
    } else {
      let postFields = this.state.postFields
      let fieldsList = postFields[ this.props.fieldType ] || {}
      fieldComponent = this.renderDynamicFieldsDropdown(fieldsList)
      extraDynamicComponent = this.renderDynamicFieldsExtra()
    }

    return (
      <div className='vcv-ui-dynamic-field-container'>
        {this.renderAutocompleteToggle()}
        <div className='vcv-ui-dynamic-field-autocomplete-container'>
          {autoCompleteComponent}
          {loader}
        </div>
        {this.renderCloseButton()}
        {fieldComponent}
        {extraDynamicComponent}
      </div>
    )
  }

  render () {
    if (!this.state.isDynamic) {
      return this.props.children || null
    }

    // In case if custom render provided
    if (this.props.render) {
      return this.props.render(this)
    }

    const { dynamicFieldOpened } = this.state
    if (dynamicFieldOpened) {
      return this.renderDynamicInputs()
    }

    return (
      <React.Fragment>
        {this.props.children}
        {this.renderOpenButton()}
      </React.Fragment>
    )
  }
}
