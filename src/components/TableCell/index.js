import './index.css'

const TableCell = props => {
  const {eachCell} = props
  const {at, text, like, author, reply} = eachCell

  return (
    <tr>
      <td>{author}</td>
      <td>{at}</td>
      <td>{like}</td>
      <td>{reply}</td>
      <td>{text}</td>
    </tr>
  )
}

export default TableCell
