import { exec, ExecException } from 'child_process'
import { pathStringsIntoTree } from './util'
import { BUCKETNAME } from '../config'

export const ls = async () => {
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

export const mv = () => {}

export const rm = () => {}

export const cp = () => {}

export const download = (
  filePath: string,
  destination: string,
  fileName: string,
) => {
  return new Promise((resolve) => {
    exec(
      // this only will grab everything up to the first space if filename has space in it
      `aws s3 cp s3://${BUCKETNAME}/${filePath} ${destination}/${fileName}`,
      (error: ExecException | null, stdout: string) => {
        if (error) {
          console.error(`ls: exec error - ${error}`)
          process.exit(0)
        }
        resolve(stdout)
      },
    )
  })
}
