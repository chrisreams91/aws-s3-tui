import { ls, rm, download } from './src/s3'
import blessed from 'blessed'
import contrib from 'blessed-contrib'
import { BUCKETNAME } from './config'

const downloadDestinationPath = '~/Desktop'

const main = async () => {
  try {
    const data = await ls()

    const screen = blessed.screen()
    const grid = new contrib.grid({ rows: 8, cols: 2, screen: screen })

    //left
    const tree = grid.set(0, 0, 8, 1, contrib.tree, {
      style: { text: 'red' },
      template: { lines: true },
      label: ` Bucket: ${BUCKETNAME} `,
    })

    //right
    //grid.set(row, col, rowSpan, colSpan, obj, opts)
    const selectedFile = grid.set(0, 1, 2, 1, blessed.log, {
      label: ' Selected File ',
    })
    const operations = grid.set(2, 1, 2, 1, blessed.log, {
      label: ' Operations ',
    })
    const pathToDownload = grid.set(4, 1, 1, 1, blessed.log, {
      label: ' Download Path ',
      content: downloadDestinationPath,
    })
    const legend = grid.set(5, 1, 3, 1, blessed.log, {
      label: ' Legend ',
      content: `To Download a file:\nSelect a file and then type 'copy'`,
    })

    const currentlySelectedFile: { path: string; name: string } = {
      path: '',
      name: '',
    }

    tree.focus()
    tree.on('select', (node) => {
      if (!node.children) {
        currentlySelectedFile.path = node.fullPath
        currentlySelectedFile.name = node.name
        selectedFile.setContent(
          `Name: ${node.name}\nSize: ${node.size} ${node.unitOfMeasure}\nPath: ${node.fullPath}`,
        )
      }
    })

    // RIP wrong types for this lib
    //@ts-ignore
    tree.setData({
      extended: true,
      children: data,
    })

    let userInput: string[] = []
    screen.key(['c', 'o', 'p', 'y', 'r', 'm'], async (key) => {
      userInput.push(key)
      const { path, name } = currentlySelectedFile
      if (!!path && !!name) {
        if (userInput.join('') === 'copy') {
          userInput = []
          await download(path, downloadDestinationPath, name)
          operations.log(`Downloaded: ${name}`)
        }
        if (userInput.join('') === 'rm') {
          userInput = []
          await rm(path)
          const updatedData = await ls()
          // @ts-ignore
          tree.setData({
            extended: true,
            children: updatedData,
          })
          operations.log(`Deleted: ${name}`)
        }
      }
    })
    screen.key(['escape', 'C-c'], () => process.exit(0))

    // fixes https://github.com/yaronn/blessed-contrib/issues/10
    screen.on('resize', () => {
      // put all elements on screen here
      pathToDownload.emit('attach')
      tree.emit('attach')
      legend.emit('attach')
      operations.emit('attach')
    })
    screen.render()
  } catch (error) {
    process.exit(0)
  }
}

main()
