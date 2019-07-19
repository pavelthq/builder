import React from 'react'
import classNames from 'classnames'
import Autocomplete from './autocomplete/Component'
import Dropdown from './dropdown/Component'
import { env, getService, getStorage } from 'vc-cake'

const settingsStorage = getStorage('settings')
const { getBlockRegexp, parseDynamicBlock } = getService('utils')
const blockRegexp = getBlockRegexp()

export default class DynamicAttribute extends React.Component {
  constructor (props) {
    super(props)

    this.handleChangeSourceId = this.handleChangeSourceId.bind(this)
    this.handleDynamicFieldOpen = this.handleDynamicFieldOpen.bind(this)
    this.handleDynamicFieldClose = this.handleDynamicFieldClose.bind(this)
    this.handleDynamicFieldChange = this.handleDynamicFieldChange.bind(this)
    this.onLoadPostFields = this.onLoadPostFields.bind(this)

    const isDynamic = env('VCV_JS_FT_DYNAMIC_FIELDS') && this.props.options && this.props.options.dynamicField
    let state = {
      isDynamic: isDynamic
    }

    if (isDynamic) {
      const postData = settingsStorage.state('postData').get()
      let sourceId = postData.post_id
      state.dynamicFieldOpened = false
      state.blockInfo = false // Default value is false if not matched
      if (typeof this.props.value === 'string' && this.props.value.match(blockRegexp)) {
        state.dynamicFieldOpened = true
        const blockInfo = parseDynamicBlock(this.props.value)
        if (blockInfo && blockInfo.blockAtts && blockInfo.blockAtts.sourceId) {
          sourceId = blockInfo.blockAtts.sourceId
          state.blockInfo = blockInfo
        }
      }
      state.sourceId = parseInt(sourceId, 10)
      state.dataLoaded = false
      state.postFields = {}
      window.setTimeout(() => {
        settingsStorage.trigger('loadDynamicPost', state.sourceId, this.onLoadPostFields)
      }, 1)
    }
    this.state = state
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
        settingsStorage.trigger('loadDynamicPost', sourceId, this.onLoadPostFields)
      }, 1)
      this.setState(state)
    }
  }

  handleDynamicFieldChange (_, dynamicFieldKey) {
    let newValue = this.props.handleDynamicFieldChange(dynamicFieldKey, this.state.sourceId)
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
    return <span className='vcv-ui-icon vcv-ui-icon-plug vcv-ui-dynamic-field-control ' onClick={this.handleDynamicFieldOpen} title='Open Dynamic Field' />
  }

  renderCloseButton () {
    return <span className='vcv-ui-icon vcv-ui-icon-close vcv-ui-dynamic-field-control' onClick={this.handleDynamicFieldClose} title='Close Dynamic Field' />
  }

  renderAutoCompleteInput () {
    return <Autocomplete
      value={this.state.sourceId + ''} // force string
      elementAccessPoint={this.props.elementAccessPoint}
      fieldKey={`${this.props.fieldKey}-dynamic-source-autocomplete`}
      options={{
        // values: fieldList
        single: true,
        action: 'dynamicPosts',
        labelAction: '',
        validation: true
      }}
      updater={this.handleChangeSourceId}
      extraClass='vcv-ui-form-field-dynamic'
    />
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
      />
    )
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
    let autoCompleteComponent = this.renderAutoCompleteInput()

    let loader = null
    let fieldComponent = null
    let extraDynamicComponent = null
    if (!this.state.dataLoaded) {
      loader = <span className='vcv-ui-icon vcv-ui-wp-spinner' />
    } else {
      let postFields = this.state.postFields
      let postFieldsKeys = Object.keys(postFields)
      if (postFieldsKeys.indexOf(this.props.fieldType) !== -1) {
        let fieldsList = postFields[ this.props.fieldType ]
        fieldComponent = this.renderDynamicFieldsDropdown(fieldsList)
        extraDynamicComponent = this.renderDynamicFieldsExtra()
      }
    }

    return (
      <React.Fragment>
        {autoCompleteComponent}
        {this.renderCloseButton()}
        {loader}
        {fieldComponent}
        {extraDynamicComponent}
      </React.Fragment>
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
