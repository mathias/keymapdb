const currentDocument = document.currentScript.ownerDocument

class SortableTable extends HTMLElement {
  constructor () {
    super()
    this._data = {}
    this._filteredSortedData = {}
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
    // search bar with filters first, TODO

    const table = this.shadowRoot.querySelector('.sortable-table__root')
    table.innerHTML = ''

    this._headers = document.createElement('tr')
    this._headers.addEventListener('click', (e) => this.headerClicked(e))

    const headers = this._data.headers || []
    headers.forEach((header) => {
      const th = document.createElement('th')
      th.innerText = header
      th.className = 'fw6 bb b--black-20 tl pb3 pr3 bg-white'
      this._headers.appendChild(th)
    })

    const thead = document.createElement('thead')
    thead.appendChild(this._headers)
    table.appendChild(thead)

    const tbody = document.createElement('tbody')
    tbody.className = 'lh-copy'

    const tdClasses = 'pv3 pr3 bb b--black-20'

    // add data here
    const rows = this._data.layouts || []
    rows.forEach((row) => {
      const tr = document.createElement('tr')
      tr.className = 'striped--light-gray'

      const tdImage = document.createElement('td')
      tdImage.className = tdClasses
      tdImage.innerHTML = row.image_url
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
