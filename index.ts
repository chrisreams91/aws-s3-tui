import { ls, rm, download } from './src/s3'
import blessed from 'blessed'
import contrib from 'blessed-contrib'
import { BUCKETNAME, DOWNLOAD_PATH } from './config'
import { ALPHABET } from './src/util'

const main = async () => {
  try {
    //
    // state
    //
    let userInput: string[] = []
    const currentlySelectedFile: { path: string; name: string } = {
      path: '',
      name: '',
    }

    //
    // UI
    //
    const screen = blessed.screen()
    const grid = new contrib.grid({ rows: 8, cols: 2, screen: screen })

    //left column
    const tree = grid.set(0, 0, 8, 1, contrib.tree, {
      style: { text: 'red' },
      template: { lines: true },
      label: ` Bucket: ${BUCKETNAME} `,
    })

    //right column
    //grid.set(row, col, rowSpan, colSpan, obj, opts)
    const selectedFile: blessed.Widgets.Log = grid.set(
      0,
      1,
      3,
      1,
      blessed.log,
      { label: ' Selected File ' },
    )
    const consoleWasTaken: blessed.Widgets.TextareaElement = grid.set(
      3,
      1,
      2,
      1,
      blessed.textarea,
      { label: ' Console ' },
    )

    const log: blessed.Widgets.Log = grid.set(5, 1, 3, 1, blessed.log, {
      label: ' log ',
    })

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

    const bucketContents = await ls()

    // RIP wrong types for this lib
    //@ts-ignore
    tree.setData({
      extended: true,
      children: bucketContents,
    })

    //
    // janky state based stuff
    //
    screen.key(['backspace'], (ch, key) => {
      userInput = []
      consoleWasTaken.setContent('')
      screen.render()
    })

    screen.key(ALPHABET.split(''), async (ch, key) => {
      userInput.push(key.name)
      consoleWasTaken.setContent(userInput.join(''))
      screen.render()

      const { path, name } = currentlySelectedFile
      if (!!path && !!name) {
        if (userInput.join('') === 'copy') {
          userInput = []
          await download(path, DOWNLOAD_PATH, name)
          log.log(`Downloaded: ${name}`)
        }
        if (userInput.join('') === 'rm') {
          userInput = []
          consoleWasTaken.setContent(userInput.join(''))
          await rm(path)
          screen.render()

          const updatedData = await ls()
          // TODO: dont close the tree - find node in current tree and remove
          // @ts-ignore
          tree.setData({
            extended: true,
            children: updatedData,
          })
          log.log(`Deleted: ${name}`)
        }
      }
      screen.render()
    })

    //
    // misc cleanup stuff
    //
    const UI_COMPONENTS = [tree, selectedFile, consoleWasTaken, log]
    UI_COMPONENTS.forEach((component) => {
      component.on('click', () => {
        component.focus()
        screen.render()
      })
    })
    // fixes https://github.com/yaronn/blessed-contrib/issues/10
    screen.on('resize', () => {
      UI_COMPONENTS.forEach((component) => {
        component.emit('attach')
      })
    })
    screen.key(['escape', 'C-c'], () => process.exit(0))
    screen.render()
  } catch (error) {
    process.exit(0)
  }
}

main()
