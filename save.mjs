import { note } from '@clack/prompts'
import { Parser } from 'json2csv';
import path from 'path'
import fs from 'fs'
import os from 'os'

import { formatJson, formatStr } from './utils.mjs'


/**
 * Description placeholder
 *
 * @param {{ extension?: string; type?: string; domain: any; }} param0
 * @param {string} [param0.extension='csv']
 * @param {string} [param0.type='Report']
 * @param {*} param0.domain
 * @returns {string}
 */
export const fileName = ({
  extension = 'csv',
  type = 'Report',
  domain,
}) => {
  const getDate = new Date()
  const date = getDate.toLocaleDateString('en-US').replaceAll('/', '.')
  const time = getDate.toLocaleTimeString('en-US').replaceAll(':', '.')
  domain = domain.replaceAll('www.', '')
  return `${type} for ${domain} - ${date} at ${time}.${extension}`
}


/**
 * Get File PAth
 *
 * @param {*} file
 * @returns {*}
 */
export const filePath = (file) => {
  return path.join(os.homedir(), 'Desktop', file)
}


/**
 * Save CSV File
 *
 * @param {*} data
 * @param {string} [file='report.csv']
 */
export const saveCsv = (data, file = 'report.csv') => {
  try {

    const fields = Array.from(new Set(data.flatMap(obj => Object.keys(obj))))
    const parser = new Parser({ fields })
    const csvData = parser.parse(data)

    fs.writeFileSync(filePath(file), csvData)

  } catch (err) {

    note(formatStr(
      `
        FAILED TO CREATE CSV FILE
        ${err}
      `
    ))

  }
}


/**
 * Save JSON File
 *
 * @param {*} data
 * @param {string} [file='report.json']
 */
export const saveJson = (data, file = 'report.json') => {
  const filepath = path.join(os.homedir(), 'Desktop', file)

  fs.writeFile(filepath, formatJson(data), (err) => {
    if (err) {
      note(formatStr(
        `
          FAILED TO CREATE JSON FILE
          ${err}
        `
      ))
    }
  })
}
