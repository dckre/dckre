'use strict'

const parse = require('../lib/parser')
const util = require('util')

var chai = require('chai')
var expect = chai.expect

console.log('\n\n\n###########################################################')
util.log('Running tests for Parser (parser.spec.js):')

chai.use(require('chai-as-promised'))

/* global describe, it */

describe('parser', () => {
  it('should parse ADD', () => {
    let parsed = parse('ADD * ./')
    expect(parsed).to.have.lengthOf(1)
    expect(parsed[0].args).to.have.lengthOf(2)
    expect(parsed[0]).to.have.property('name')
  })

  it('should parse ARG', () => {
    let parsed = parse('ARG user1')
    expect(parsed).to.have.lengthOf(1)
    expect(parsed[0].args[0]).to.equal('user1')
    expect(parsed[0].name).to.equal('ARG')

    parsed = parse('ARG user1=someuser')
    expect(parsed).to.have.lengthOf(1)
    expect(parsed[0].args).to.have.lengthOf(1)
    expect(parsed[0].name).to.equal('ARG')
  })

  it('should parse CMD in exec form', () => {
    let parsed = parse('CMD ["executable","param1","param2"]')
    expect(parsed).to.have.lengthOf(1)
    expect(parsed[0].args).to.have.lengthOf(3)
    expect(parsed[0].name).to.equal('CMD')
  })

  it('should parse CMD in shell form', () => {
    let parsed = parse('CMD command param1 param2')
    expect(parsed).to.have.lengthOf(1)
    expect(parsed[0].args).to.be.a.string
    expect(parsed[0].name).to.equal('CMD')
  })

  it('should parse COPY in shell form', () => {
    let parsed = parse('COPY init.sh test.js ./')
    expect(parsed).to.have.lengthOf(1)
    expect(parsed[0].args).to.have.lengthOf(3)
    expect(parsed[0].name).to.equal('COPY')
  })

  it('should parse COPY in array form', () => {
    let parsed = parse('COPY ["file with whitespace.txt", "init.sh", "/opt/"]')
    expect(parsed).to.have.lengthOf(1)
    expect(parsed[0].args).to.have.lengthOf(3)
    expect(parsed[0].name).to.equal('COPY')
  })

  it('should parse ENTRYPOINT in exec form', () => {
    let parsed = parse('ENTRYPOINT ["executable", "param1", "param2"]')
    expect(parsed).to.have.lengthOf(1)
    expect(parsed[0].args).to.have.lengthOf(3)
    expect(parsed[0].name).to.equal('ENTRYPOINT')
    expect(parsed[0].args[2]).to.equal('param2')
  })

  it('should parse ENTRYPOINT in shell form', () => {
    let parsed = parse('ENTRYPOINT command param1 param2')
    expect(parsed).to.have.lengthOf(1)
    expect(parsed[0].args).to.have.lengthOf(21)
    expect(parsed[0].name).to.equal('ENTRYPOINT')
  })

  it('should parse single ENV', () => {
    let parsed = parse('ENV TESTKEY testval')
    expect(parsed).to.have.lengthOf(1)
    expect(parsed[0].args).to.be.object
    expect(parsed[0].args).to.have.property('TESTKEY')
    expect(parsed[0].args.TESTKEY).to.equal('testval')
    expect(parsed[0].name).to.equal('ENV')
  })

  it('should parse multiple ENV', () => {
    let parsed = parse('ENV TESTKEY=testval TESTKEY2=testval2')
    expect(parsed).to.have.lengthOf(1)
    expect(parsed[0].args).to.be.object
    expect(parsed[0].args.TESTKEY).to.equal('testval')
    expect(parsed[0].args.TESTKEY2).to.equal('testval2')
    expect(parsed[0].name).to.equal('ENV')
  })

  it('should parse multiple ENV with whitespace and linebreak', () => {
    let parsed = parse('ENV myName="John Doe" myDog=Rex\\ The\\ Dog \\\nmyCat=fluffy')
    expect(parsed).to.have.lengthOf(1)
    expect(parsed[0].args).to.be.object
    expect(parsed[0].args.myName).to.equal('"John Doe"')
    expect(parsed[0].args.myDog).to.equal('Rex\\ The\\ Dog')
    expect(parsed[0].args.myCat).to.equal('fluffy')
    expect(parsed[0].name).to.equal('ENV')
  })

  it('should parse single EXPOSE', () => {
    let parsed = parse('EXPOSE 8080')
    expect(parsed).to.have.lengthOf(1)
    expect(parsed[0].args).to.have.lengthOf(1)
    expect(parsed[0].args[0]).to.equal('8080')
    expect(parsed[0].name).to.equal('EXPOSE')
  })

  it('should parse multiple EXPOSE', () => {
    let parsed = parse('EXPOSE 8080 11235 4242')
    expect(parsed).to.have.lengthOf(1)
    expect(parsed[0].args).to.have.lengthOf(3)
    expect(parsed[0].name).to.equal('EXPOSE')
  })

  it('should parse simple FROM', () => {
    let parsed = parse('FROM alpine')
    expect(parsed).to.have.lengthOf(1)
    expect(parsed[0].args).to.equal('alpine')
    expect(parsed[0].name).to.equal('FROM')
  })

  it('should parse FROM with tag', () => {
    let parsed = parse('FROM alpine:3.3')
    expect(parsed).to.have.lengthOf(1)
    expect(parsed[0].args).to.equal('alpine:3.3')
    expect(parsed[0].name).to.equal('FROM')
  })

  it('should parse FROM with digest', () => {
    let parsed = parse('FROM alpine@77af4d6b9913')
    expect(parsed).to.have.lengthOf(1)
    expect(parsed[0].args).to.equal('alpine@77af4d6b9913')
    expect(parsed[0].name).to.equal('FROM')
  })

  it('should parse FROM with repo and tag', () => {
    let parsed = parse('FROM beevelop/nodejs-python:latest')
    expect(parsed).to.have.lengthOf(1)
    expect(parsed[0].args).to.have.lengthOf(29)
    expect(parsed[0].name).to.equal('FROM')
  })

  it('should parse single LABEL with quoted value and key', () => {
    let parsed = parse('LABEL "com.example.vendor"="ACME Incorporated"')
    expect(parsed).to.have.lengthOf(1)
    expect(parsed[0].args['"com.example.vendor"']).to.equal('"ACME Incorporated"')
    expect(parsed[0].name).to.equal('LABEL')
  })

  it('should parse single LABEL with quoted value', () => {
    let parsed = parse('LABEL com.example.label-with-value="foo"')
    expect(parsed).to.have.lengthOf(1)
    expect(parsed[0].args['com.example.label-with-value']).to.equal('"foo"')
    expect(parsed[0].name).to.equal('LABEL')
  })

  it('should parse single LABEL with multiline value', () => {
    let parsed = parse('LABEL description="This text illustrates \\\nthat label-values can span multiple lines."')
    expect(parsed).to.have.lengthOf(1)
    expect(parsed[0].args).to.have.property('description')
    expect(parsed[0].args.description).to.have.lengthOf(66)
    expect(parsed[0].name).to.equal('LABEL')
  })

  it('should parse multiple LABEL', () => {
    let parsed = parse('LABEL multi.label1="value1" multi.label2="value2" other="value3"')
    expect(parsed).to.have.lengthOf(1)
    expect(parsed[0].args).to.have.property('multi.label1')
    expect(parsed[0].args).to.have.property('multi.label2')
    expect(parsed[0].args).to.have.property('other')
    expect(parsed[0].name).to.equal('LABEL')
  })

  it('should parse multiple LABEL in mutliple lines', () => {
    let parsed = parse('LABEL multi.label1="value1" \\\n    multi.label2="value2" \\\n    other="value3"')
    expect(parsed).to.have.lengthOf(1)
    expect(parsed[0].args).to.have.property('multi.label1')
    expect(parsed[0].args).to.have.property('multi.label2')
    expect(parsed[0].args).to.have.property('other')
    expect(parsed[0].args.other).to.equal('"value3"')
    expect(parsed[0].name).to.equal('LABEL')
  })

  it('should parse MAINTAINER', () => {
    let parsed = parse('MAINTAINER Maik Hummel <m@ikhummel.com>')
    expect(parsed).to.have.lengthOf(1)
    expect(parsed[0].args).to.equal('Maik Hummel <m@ikhummel.com>')
    expect(parsed[0].name).to.equal('MAINTAINER')
  })

  it('should parse ONBUILD with ADD instruction', () => {
    let parsed = parse('ONBUILD ADD . /app/src')
    let parsedAdd = parse('ADD . /app/src')
    expect(parsed).to.have.lengthOf(1)
    expect(parsed[0].args).to.eql(parsedAdd[0])
    expect(parsed[0].name).to.equal('ONBUILD')
  })

  it('should parse ONBUILD with RUN instruction', () => {
    let parsed = parse('ONBUILD RUN /usr/local/bin/python-build --dir /app/src')
    let parsedRun = parse('RUN /usr/local/bin/python-build --dir /app/src')
    expect(parsed).to.have.lengthOf(1)
    expect(parsed[0].args).to.eql(parsedRun[0])
    expect(parsed[0].name).to.equal('ONBUILD')
  })

  it('should parse simple RUN in shell form', () => {
    let parsed = parse('RUN apt-get update && apt-get install -y curl')
    expect(parsed).to.have.lengthOf(1)
    expect(parsed[0].args).to.equal('apt-get update && apt-get install -y curl')
    expect(parsed[0].name).to.equal('RUN')
  })

  it('should parse simple RUN in exec form', () => {
    let parsed = parse('RUN ["/bin/bash", "-c", "apt-get update && apt-get install -y curl"]')
    expect(parsed).to.have.lengthOf(1)
    expect(parsed[0].args).to.have.lengthOf(3)
    expect(parsed[0].args[1]).to.equal('-c')
    expect(parsed[0].name).to.equal('RUN')
  })

  it('should parse multiline RUN in shell form', () => {
    let parsed = parse("RUN /bin/bash -c 'source $HOME/.bashrc ;\\\necho $HOME'")
    expect(parsed).to.have.lengthOf(1)
    expect(parsed[0].args).to.be.a.string
    expect(parsed[0].name).to.equal('RUN')
  })

  it('should parse STOPSIGNAL', () => {
    let parsed = parse('STOPSIGNAL 9')
    expect(parsed).to.have.lengthOf(1)
    expect(parsed[0].args).to.equal('9')
    expect(parsed[0].name).to.equal('STOPSIGNAL')
  })

  it('should parse USER', () => {
    let parsed = parse('USER daemon')
    expect(parsed).to.have.lengthOf(1)
    expect(parsed[0].args).to.equal('daemon')
    expect(parsed[0].name).to.equal('USER')
  })

  it('should parse VOLUME in string format', () => {
    let parsed = parse('VOLUME /var/log /var/db')
    expect(parsed).to.have.lengthOf(1)
    expect(parsed[0].args).to.have.lengthOf(2)
    expect(parsed[0].name).to.equal('VOLUME')
  })

  it('should parse VOLUME in JSON format', () => {
    let parsed = parse('VOLUME ["/var/log", "/var/db"]')
    expect(parsed).to.have.lengthOf(1)
    expect(parsed[0].args).to.have.lengthOf(2)
    expect(parsed[0].name).to.equal('VOLUME')
  })

  it('should be the same VOLUME for string and JSON format (ignoring raw value)', () => {
    let parsedJSON = parse('VOLUME ["/var/log", "/var/db"]')
    let parsedString = parse('VOLUME /var/log /var/db')
    delete parsedJSON[0].raw
    delete parsedString[0].raw
    expect(parsedJSON).to.eql(parsedString)
  })

  it('should parse absolute WORKDIR', () => {
    let parsed = parse('WORKDIR /path/to/workdir')
    expect(parsed).to.have.lengthOf(1)
    expect(parsed[0].args).to.equal('/path/to/workdir')
    expect(parsed[0].name).to.equal('WORKDIR')
  })

  it('should parse relative WORKDIR', () => {
    let parsed = parse('WORKDIR b')
    expect(parsed).to.have.lengthOf(1)
    expect(parsed[0].args).to.equal('b')
    expect(parsed[0].name).to.equal('WORKDIR')
  })
})

describe('INC_ENV', () => {
  it('should parse single INC_ENV', () => {
    let parsed = parse('INC_ENV TESTKEY testval')
    expect(parsed).to.have.lengthOf(1)
    expect(parsed[0].args).to.be.object
    expect(parsed[0].args).to.have.property('TESTKEY')
    expect(parsed[0].args.TESTKEY).to.equal('testval')
    expect(parsed[0].name).to.equal('INC_ENV')
  })

  it('should parse multiple INC_ENV', () => {
    let parsed = parse('INC_ENV TESTKEY=testval TESTKEY2=testval2')
    expect(parsed).to.have.lengthOf(1)
    expect(parsed[0].args).to.be.object
    expect(parsed[0].args.TESTKEY).to.equal('testval')
    expect(parsed[0].args.TESTKEY2).to.equal('testval2')
    expect(parsed[0].name).to.equal('INC_ENV')
  })

  it('should parse multiple INC_ENV with whitespace and linebreak', () => {
    let parsed = parse('INC_ENV myName="John Doe" myDog=Rex\\ The\\ Dog \\\nmyCat=fluffy')
    expect(parsed).to.have.lengthOf(1)
    expect(parsed[0].args).to.be.object
    expect(parsed[0].args.myName).to.equal('"John Doe"')
    expect(parsed[0].args.myDog).to.equal('Rex\\ The\\ Dog')
    expect(parsed[0].args.myCat).to.equal('fluffy')
    expect(parsed[0].name).to.equal('INC_ENV')
  })
})

describe('INCLUDE', () => {
  it('should parse INCLUDE in exec form', () => {
    let parsed = parse('INCLUDE ["repo", "file"]')
    expect(parsed).to.have.lengthOf(1)
    expect(parsed[0].args).to.have.lengthOf(2)
    expect(parsed[0].name).to.equal('INCLUDE')
    expect(parsed[0].args[0]).to.equal('repo')
    expect(parsed[0].args[1]).to.equal('file')
  })

  it('should parse INCLUDE in shell form', () => {
    let parsed = parse('INCLUDE repo')
    expect(parsed).to.have.lengthOf(1)
    expect(parsed[0].args).to.have.lengthOf(4)
    expect(parsed[0].name).to.equal('INCLUDE')
  })
})
