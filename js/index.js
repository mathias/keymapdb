const currentDocument = document.currentScript.ownerDocument

class SortableTable extends HTMLElement {
  constructor () {
    super()
    this._data = {}
    this._filteredData = {}
    this._selected = null
    this._column = null
    this._direction = null
  }

  get src () {
    return this.getAttribute('src')
  }

  set src (value) {
    this.setAttribute('src', value)
    this.setSrc(value)
  }

  async setSrc () {
    if (this.hasAttribute('src')) {
      this._data = await this.fetchSrc(this.src)
      this.render()
    }
  }

  async fetchSrc (src) {
    const response = await fetch(src)
    if (response.status !== 200) { throw Error(`ERR ${response.status}: ${response.statusText}`) }

    return response.json()
  }

  headerClicked (e) {
    this._selected = e.target.cellIndex
    const column = e.target.id

    this._direction = (column !== this._column) ? true : !this._direction
    this._column = column
    this.render()
  }

  sortData (data) {
    if (this._column === null) return data

    const col = this._column
    const dir = this._direction
    const comp = dir ? (a, b) => a < b : (a, b) => a > b
    return data.sort((a, b) => {
      let aVal, bVal;
      aVal = Array.isArray(a[col]) ? a[col][0] : a[col]
      bVal = Array.isArray(b[col]) ? b[col][0] : b[col]

      return comp(aVal, bVal) ? -1 : 1
    })
  }

  // Called when the element is inserted in DOM
  connectedCallback () {
    const shadowRoot = this.attachShadow({ mode: 'open' })

    const template = currentDocument.querySelector('#sortable-table-template')
    const instance = template.content.cloneNode(true)
    shadowRoot.appendChild(instance)

    // Set ID
    // const tableId = this.getAttribute('table-id')
    if (this.hasAttribute('src')) {
      this.setSrc() // also renders
    }
  }

  render () {
    this._filteredData = JSON.parse(JSON.stringify(this._data))
    // search bar with filters first, TODO

    const table = this.shadowRoot.querySelector('.sortable-table__root')

    const thead = this.shadowRoot.querySelector('thead')
    thead.innerHTML = '' // Clear this out on each render for lack of a better way

    this._headers = document.createElement('tr')
    this._headers.addEventListener('click', (e) => this.headerClicked(e))

    const headers = this._filteredData.headers || []
    headers.forEach((header, idx) => {
      const th = document.createElement('th')
      th.innerText = header
      th.id = header.toLowerCase().replaceAll(' ', '_').replaceAll(')', '').replaceAll('(', '')
      th.className = 'fw6 bb b--black-20 tl pb3 pr3 bg-white'
      this._headers.appendChild(th)
    })

    thead.appendChild(this._headers)

    const tbody = this.shadowRoot.querySelector('tbody')
    tbody.innerHTML = '' // Clear this out on each render for lack of a better way

    const tdClasses = 'pv3 pr3 bb b--black-20'

    const rows = this.sortData([...this._filteredData.layouts])
    rows.forEach((row) => {
      const tr = document.createElement('tr')
      tr.className = 'striped--light-gray'

      const tdImage = document.createElement('td')
      tdImage.className = tdClasses
      // tdImage.innerHTML = row.image_url
      tr.appendChild(tdImage)

      const tdName = document.createElement('td')
      tdName.className = tdClasses
      const linkName = document.createElement('a')
      linkName.setAttribute('href', row.url)
      linkName.innerHTML = row.name
      tdName.appendChild(linkName)
      tr.appendChild(tdName)

      const tdFirmware = document.createElement('td')
      tdFirmware.className = tdClasses
      tdFirmware.innerHTML = row.firmware
      tr.appendChild(tdFirmware)

      const tdLanguage = document.createElement('td')
      tdLanguage.className = tdClasses
      tdLanguage.innerHTML = row.language
      tr.appendChild(tdLanguage)

      const tdAlphas = document.createElement('td')
      tdAlphas.className = tdClasses
      tdAlphas.innerHTML = row.alphas_layout
      tr.appendChild(tdAlphas)

      const tdModels = document.createElement('td')
      tdModels.className = tdClasses
      tdModels.innerHTML = row.keyboard_models
      tr.appendChild(tdModels)

      const tdKeys = document.createElement('td')
      tdKeys.className = tdClasses
      let keyStr = ''
      const keyRange = row.key_range
      if (keyRange.length === 2 && keyRange[1] === '+') {
        keyStr = keyRange.join('')
      } else {
        keyStr = row.key_range.join(', ')
      }
      tdKeys.innerHTML = keyStr
      tr.appendChild(tdKeys)

      tbody.appendChild(tr)
    })
    table.appendChild(tbody)
  }
}

customElements.define('sortable-table', SortableTable)
