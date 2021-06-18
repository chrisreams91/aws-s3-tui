export interface TreeNode {
  [name: string]: {
    name: string
    children?: TreeNode
    size?: string
    unitOfMeasure?: string
    fullPath?: string
  }
}
