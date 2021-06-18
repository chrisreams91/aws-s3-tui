import _ from 'lodash'
import { TreeNode } from './types'

export const pathStringsIntoTree = (paths: string[]): TreeNode => {
  const mappedPaths = paths.map((originalPath) => {
    const split = originalPath.split('/')
    const fullPath = originalPath.split(' ')[0]
    const objectTree = buildPath(split, fullPath)
    return objectTree[0]
  })

  let finalForm = {}
  mappedPaths.forEach((mappedPath) => {
    const merged = _.merge(finalForm, mappedPath)
    finalForm = merged
  })

  return finalForm
}

// returns array with first element being the entire tree
// subsequent elements are missing nodes
// this is i am returning first index in pathStringsIntoTree for now
const buildPath = (paths: string[], originalPath: string): TreeNode[] => {
  return paths.map((pathChunk, index) => {
    const split = pathChunk.split(' ')
    return {
      [split[0]]: {
        name: split[0],
        children: buildPath(paths.slice(index + 1), originalPath)[0],
        ...(paths.length === 1
          ? { fullPath: originalPath, size: split[1], unitOfMeasure: split[2] }
          : null),
      },
    }
  })
}
