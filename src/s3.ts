import { exec, ExecException } from 'child_process'
import { pathStringsIntoTree } from './util'
import { BUCKETNAME } from '../config'
import { TreeNode } from './types'

export const ls = async (): Promise<TreeNode> => {
  return new Promise((resolve) => {
    exec(
      // this only will grab everything up to the first space if filename has space in it
      `aws s3 ls s3://${BUCKETNAME} --recursive --human-readable --summarize | awk '{print $5, $3, $4}'`,
      (error: ExecException | null, stdout: string) => {
        if (error) {
          console.error(`ls: exec error - ${error}`)
          process.exit(0)
        }

        const lines = stdout.split('\n')
        const paths = lines.slice(0, -4)
        // Bucket stats
        const bucketStats = lines.slice(-4)
        const bucketObjectCount = bucketStats[1]
        const bucketSize = bucketStats[2]
        // set to globle state?

        const tree = pathStringsIntoTree(paths)
        resolve(tree)
      },
    )
  })
}

export const rm = (filePath: string): Promise<void> => {
  return new Promise((resolve) => {
    exec(
      `aws s3 rm s3://${BUCKETNAME}/${filePath}`,
      (error: ExecException | null, stdout: string) => {
        if (error) {
          console.error(`ls: exec error - ${error}`)
          process.exit(0)
        }

        resolve()
      },
    )
  })
}

export const download = (
  filePath: string,
  destination: string,
  fileName: string,
): Promise<void> => {
  return new Promise((resolve) => {
    exec(
      // this only will grab everything up to the first space if filename has space in it
      `aws s3 cp s3://${BUCKETNAME}/${filePath} ${destination}/${fileName}`,
      (error: ExecException | null, stdout: string) => {
        if (error) {
          console.error(`ls: exec error - ${error}`)
          process.exit(0)
        }
        resolve()
      },
    )
  })
}

export const mv = () => {}

export const cp = () => {}
