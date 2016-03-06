'use strict'

const $fsp = require('fs-extra-promise')
const $parser = require('./parser')
const util = require('util')
const path = require('path')
const Promise = require('bluebird')

class Processor {
  constructor(dckrefile) {
    this.INC_ENVs = []
    this.processors = {
      INCLUDE: this.processInclude,
      INC_ENV: this.processIncEnv,
      ENV: this.processEnv
    }

    $fsp
      .readFileAsync(dckrefile, 'utf8')
      .bind(this)
      .then(this.iterate)
      .then((arr) => {
        // console.log(arr)
        return arr
      })
      .map((instruction) => {
        return instruction.raw
      })
      .then((raw) => {
        console.log(raw.join('\n\n'))
      })
      .catch((err) => {
        console.error(err)
      })
  }

  iterate(contents) {
    return Promise.resolve($parser(contents))
      .bind(this)
      .map((instruction) => {
        if (instruction.name in this.processors) {
          let processor = this.processors[instruction.name].bind(this)
          return processor(instruction)
        }
        return instruction
      })
      .reduce((prev, current) => {
        return prev.concat(current)
      }, [])
  }

  processIncEnv(instruction) {
    instruction.name = 'ENV'
    instruction.raw = instruction.raw.replace('INC_ENV', 'ENV')
    let INC_ENVs = Object.keys(instruction.args)
    this.INC_ENVs = this.INC_ENVs.concat(INC_ENVs)
    return instruction
  }

  processEnv(instruction) {
    this.INC_ENVs.forEach(function (incEnv) {
      if (incEnv in instruction.args) {
        delete instruction.args[incEnv]
      }
    })

    return instruction
  }

  processInclude(instruction) {
    return this.include(instruction.args).then(this.iterate.bind(this))
  }

  include(args) {
    let pkg = args
    let file = 'main.dckre'
    if (util.isArray(args)) {
      pkg = args[0]
      if (args.length > 1) {
        file = args[1]
      }
    }

    // Enforce "dckre-" prefix to enable suitable filtering on npm
    pkg = 'dckre-' + pkg

    let incPath = path.resolve('node_modules', pkg, file)
    return $fsp.readFileAsync(incPath, 'utf8')
  }
}

// get all INC-envs
module.exports = Processor
