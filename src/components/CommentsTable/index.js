import {Component} from 'react'

import {v4 as uuidV4} from 'uuid'

import {SpinnerDotted} from 'spinners-react'
import {BsChevronExpand} from 'react-icons/bs'
import {HiOutlineChevronDown, HiOutlineChevronUp} from 'react-icons/hi'

import TableCell from '../TableCell'

import './index.css'

const apiObj = {
  initial: 'INITIAL',
  loading: 'LOADING',
  success: 'SUCCESS',
  failure: 'FAILURE',
}

const filterByList = [
  {id: 1, value: 'author', displayText: 'Author'},
  {id: 2, value: 'at', displayText: 'At'},
  {id: 3, value: 'like', displayText: 'Like'},
  {id: 4, value: 'reply', displayText: 'Reply'},

  {id: 5, value: 'text', displayText: 'Text'},
]

const paginationList = [
  {value: 25, displayText: '25 per page'},
  {value: 50, displayText: '50 per page'},
  {value: 100, displayText: '100 per page'},
]

class CommentsTable extends Component {
  state = {
    apiStatus: apiObj.initial,
    commentsList: [],
    activeFilter: filterByList[0].value,
    searchInput: '',
    displayPages: paginationList[0].value,
    activeBtn: 1,
    startIndex: 0,
    activeField: '',
    sortBy: 'DSC',
    endIndex: paginationList[0].value,
  }

  componentDidMount() {
    this.getData()
  }

  onPagination = event => {
    this.setState({
      displayPages: event.target.value,
      activeBtn: 1,
      startIndex: 0,
      endIndex: parseInt(event.target.value),
    })
  }

  getData = async () => {
    this.setState({apiStatus: apiObj.loading})
    const url =
      'https://cors-anywhere.herokuapp.com/https://dev.ylytic.com/ylytic/test'

    const response = await fetch(url)

    console.log(response.ok)
    if (response.ok === true) {
      const data = await response.json()
      const updatedData = data.comments.map(each => ({
        at: each.at,
        like: each.like.toString(),
        id: uuidV4(),
        author: each.author,
        text: each.text,
        reply: each.reply.toString(),
      }))
      this.setState({commentsList: updatedData, apiStatus: apiObj.success})
    } else {
      this.setState({apiStatus: apiObj.failure})
    }
  }

  onInputChange = event => {
    this.setState(prev => ({
      searchInput: event.target.value,
      startIndex: 0,
      activeBtn: 1,
      endIndex: parseInt(prev.displayPages),
    }))
  }

  getDateSorted = filteredList => {
    const {sortBy, activeField} = this.state
    if (sortBy === 'ASC') {
      return filteredList.sort((p1, p2) =>
        new Date(p1[activeField]) > new Date(p2[activeField]) ? 1 : -1,
      )
    }
    console.log('triggered')
    return filteredList.sort((p1, p2) =>
      new Date(p1[activeField]) < new Date(p2[activeField]) ? 1 : -1,
    )
  }

  getTextSorted = filteredList => {
    const {sortBy, activeField} = this.state
    if (sortBy === 'ASC') {
      return filteredList.sort((p1, p2) =>
        p1[activeField].toLowerCase().replace(/[^a-zA-Z0-9 ]/g, '') >
        p2[activeField].toLowerCase().replace(/[^a-zA-Z0-9 ]/g, '')
          ? 1
          : -1,
      )
    }

    return filteredList.sort((p1, p2) =>
      p1[activeField].toLowerCase().replace(/[^a-zA-Z0-9 ]/g, '') <
      p2[activeField].toLowerCase().replace(/[^a-zA-Z0-9 ]/g, '')
        ? 1
        : -1,
    )
  }

  getLikeAndReplySorted = filteredList => {
    const {sortBy, activeField} = this.state
    if (sortBy === 'ASC') {
      return filteredList.sort((p1, p2) =>
        parseInt(p1[activeField]) > parseInt(p2[activeField]) ? 1 : -1,
      )
    }

    return filteredList.sort((p1, p2) =>
      parseInt(p1[activeField]) < parseInt(p2[activeField]) ? 1 : -1,
    )
  }

  getFinalList = () => {
    const {
      activeFilter,
      commentsList,
      searchInput,

      activeField,
    } = this.state

    const filteredList = commentsList.filter(each =>
      each[activeFilter].toLowerCase().includes(searchInput.toLowerCase()),
    )
    if (activeField !== '') {
      if (activeField === 'at') {
        return this.getDateSorted(filteredList)
      }

      if (activeField === 'author' || activeField === 'text') {
        return this.getTextSorted(filteredList)
      }

      if (activeField === 'like' || activeField === 'reply') {
        return this.getLikeAndReplySorted(filteredList)
      }
    }

    return filteredList
  }

  onFilterChange = event => {
    this.setState({activeFilter: event.target.value})
  }

  getPageButtonsList = pageButtonList => {
    const {displayPages} = this.state
    const listLength = pageButtonList.length
    let buttons = listLength / displayPages
    const checkButtons = Math.floor(pageButtonList.length % displayPages)
    if (checkButtons !== 0) {
      buttons += 1
    }
    buttons = Math.floor(buttons)
    const buttonsList = []
    for (let i = 1; i < buttons + 1; i += 1) {
      const obj = {id: i}
      buttonsList.push(obj)
    }

    return buttonsList
  }

  renderPagesList = () => {
    const {displayPages} = this.state
    return (
      <select
        className="pagination-input"
        value={displayPages}
        onChange={this.onPagination}
      >
        {paginationList.map(each => (
          <option key={each.value} value={each.value}>
            {each.displayText}
          </option>
        ))}
      </select>
    )
  }

  renderSearchAndSortContainer = () => {
    const {searchInput, activeFilter} = this.state

    return (
      <div className="search-container">
        <input
          className="input-container"
          value={searchInput}
          onChange={this.onInputChange}
          type="search"
          placeholder="Search Here"
        />
        <select
          className="filter-container"
          value={activeFilter}
          onChange={this.onFilterChange}
        >
          {filterByList.map(each => (
            <option value={each.value} key={each.id}>
              {each.displayText}
            </option>
          ))}
        </select>
      </div>
    )
  }

  renderTable = () => {
    const {startIndex, endIndex, activeField, sortBy} = this.state

    const finalList = this.getFinalList()
    const slicedList = finalList.slice(startIndex, endIndex)

    return (
      <table>
        <tr className="table-head-row">
          {filterByList.map(each => {
            let element = <BsChevronExpand size={22} />
            if (activeField === each.value) {
              if (sortBy === 'ASC') {
                element = <HiOutlineChevronDown size={22} />
              } else {
                element = <HiOutlineChevronUp size={22} />
              }
            }
            const onArrowBtn = () => {
              this.onTableFieldSort(each.value)
            }

            return (
              <th key={each.id}>
                {each.displayText}{' '}
                <button className="arrowBtn" type="button" onClick={onArrowBtn}>
                  {element}
                </button>
              </th>
            )
          })}
        </tr>
        {slicedList.map(each => (
          <TableCell
            key={each.id}
            eachCell={each}
            onTableField={this.onTableFieldSort}
          />
        ))}
      </table>
    )
  }

  onBtn = id => {
    const {activeBtn, displayPages} = this.state
    const startId = id - 1
    const newStartIndex = displayPages * startId

    const newEndIndex = displayPages * id

    if (id !== activeBtn) {
      this.setState({
        activeBtn: id,

        startIndex: newStartIndex,
        endIndex: newEndIndex,
      })
    }
  }

  onNextBtn = () => {
    const finalList = this.getFinalList()
    const buttonsList = this.getPageButtonsList(finalList)
    console.log(buttonsList)
    const l = buttonsList.length
    const {activeBtn} = this.state

    if (activeBtn < l) {
      this.onBtn(activeBtn + 1)
    }
  }

  onPrevBtn = () => {
    const finalList = this.getFinalList()
    const buttonsList = this.getPageButtonsList(finalList)
    console.log(buttonsList)

    const {activeBtn} = this.state

    if (activeBtn > 1) {
      this.onBtn(activeBtn - 1)
    }
  }

  renderButtons = () => {
    const finalList = this.getFinalList()
    const pageButtonsList = this.getPageButtonsList(finalList)
    return (
      <div className="btn-container">
        <button type="button" onClick={this.onPrevBtn} className="btn">
          {'<'}
        </button>
        {pageButtonsList.map(each => {
          const {activeBtn} = this.state
          const onBtnChange = () => {
            this.onBtn(each.id)
          }

          return (
            <button
              key={each.id}
              value={each.id}
              className={activeBtn === each.id ? 'active btn' : 'btn'}
              type="button"
              onClick={onBtnChange}
            >
              {each.id}
            </button>
          )
        })}
        <button type="button" onClick={this.onNextBtn} className="btn">
          {'>'}
        </button>
      </div>
    )
  }

  renderSuccessView = () => {
    const finalList = this.getFinalList()

    return (
      <div className="success-container">
        <div className="search-and-sort-container">
          {this.renderSearchAndSortContainer()}
          <p className="records">{finalList.length} Records</p>
          <div>
            {this.renderPagesList()}
            {this.renderButtons()}
          </div>
        </div>

        {this.renderTable()}
        {this.renderButtons()}
      </div>
    )
  }

  onRetry = () => {
    this.getData()
  }

  renderFailureView = () => (
    <div className="loader">
      <p className="fail">Oops Something Went Wrong...</p>
      <p className="fail">
        Get Access By Clicking Access Button or Click on Retry Button
      </p>
      <button onClick={this.onRetry} className="btn" type="button">
        Retry
      </button>
      <a
        target="__blank"
        href="https://cors-anywhere.herokuapp.com/https://dev.ylytic.com/ylytic/test"
      >
        Get Access
      </a>
    </div>
  )

  onTableFieldSort = field => {
    const {activeField, sortBy} = this.state
    console.log(field)

    if (field === activeField) {
      const newSort = sortBy === 'DSC' ? 'ASC' : 'DSC'
      this.setState({sortBy: newSort})
    } else {
      this.setState({sortBy: 'ASC', activeField: field})
    }
  }

  renderLoader = () => (
    <div className="loader">
      <SpinnerDotted size={80} thickness={160} speed={100} color="orange" />
    </div>
  )

  renderResult = () => {
    const {apiStatus} = this.state

    switch (apiStatus) {
      case apiObj.success:
        return this.renderSuccessView()
      case apiObj.loading:
        return this.renderLoader()
      case apiObj.failure:
        return this.renderFailureView()

      default:
        return null
    }
  }

  render() {
    const {sortBy} = this.state
    console.log(sortBy)
    return (
      <div className="bg-container">
        <div className="content-container">
          <h1>Comments Table</h1>
          {this.renderResult()}
        </div>
      </div>
    )
  }
}

export default CommentsTable
