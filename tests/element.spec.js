import { html, css, registerElement, OzElementSymbol, OzElementContextSymbol, reactivity } from '../src/index.js'

const usedTags = []

const tagName = (name, tag = `${name || 'foo'}-${Math.random().toString(36).substring(7)}`) =>
  usedTags.includes(tag)
    ? tagName(name)
    : usedTags.push(tag) && tag

describe('OzElement', () => {
  let container, Class, instance
  const setElement = options =>
    (Class = registerElement({ name: tagName(), ...options })) &&
    container.appendChild(instance = document.createElement(Class.name))
  beforeEach(() => document.body.appendChild(container = document.createElement('div')))
  afterEach(() => container.remove() || (container = undefined) || (instance = undefined))
  it('return an OzElement instance', () => {
    setElement()
    expect(instance).to.have.property(OzElementSymbol)
  })
  describe('options', () => {
    describe('#name', () => {
      it('set the element tag name', () => {
        const tag = tagName()
        setElement({ name: tag })
        expect(instance.tagName).to.equal(tag.toUpperCase())
      })
    })
    describe('#state', () => {
      it('define an empty reactive object by default', () => {
        setElement({})
        expect(instance[OzElementContextSymbol].state).to.have.property(reactivity).not.equal(false)
      })
      describe('is function', () => {
        it('call with context as this and first argument', () => {
          let ctxArg, ctxThis
          setElement({
            state (ctx) {
              ctxThis = this
              ctxArg = ctx
              return {}
            }
          })
          expect(ctxThis).to.equal(instance[OzElementContextSymbol])
          expect(ctxArg).to.equal(instance[OzElementContextSymbol])
        })
      })
      describe('is object', () => {
        it('call with context as this and first argument', () => {
          setElement({ state: {} })
          expect(instance[OzElementContextSymbol]).to.have.property('state').to.have.property(reactivity).not.equal(false)
        })
      })
    })
    describe('#props', () => {
      it('set the property values to the instance itself', () => {
        setElement({ props: ['foo'] })
        expect(instance.constructor.observedAttributes).to.eql(['foo'])
        expect(_ => (instance.foo = 'bar')).to.not.throw()
        expect(instance.foo).to.equal('bar')
      })
      it('set the property values to the props in the context', () => {
        setElement({ props: ['foo'] })
        expect(instance.constructor.observedAttributes).to.eql(['foo'])
        expect(_ => (instance.foo = 'bar')).to.not.throw()
        expect(instance[OzElementContextSymbol].props.foo).to.equal('bar')
      })
    })
    describe('#watchers', () => {
      describe('watcher only', () => {
        it('re-evaluate watcher for each watcher dependency change', () => {
          let value, ctx
          setElement({
            props: ['foo'],
            watchers: [(_ctx) => (ctx = _ctx) && (value = _ctx.props.foo)]
          })
          expect(_ => (instance.foo = 'bar')).to.not.throw()
          expect(ctx).to.equal(instance[OzElementContextSymbol])
          expect(value).to.equal('bar')
        })
      })
      describe('watcher and handler', () => {
        it('re-evaluate watcher for each watcher dependency change and call handler with watcher return', () => {
          let value, value2, ctx, ctx2
          setElement({
            props: ['foo'],
            watchers: [[(_ctx) => (ctx = _ctx) && (value = _ctx.props.foo), (ctx, val) => (ctx2 = ctx) && (value2 = val)]]
          })
          expect(_ => (instance.foo = 'bar')).to.not.throw()
          expect(ctx).to.equal(instance[OzElementContextSymbol])
          expect(value).to.equal('bar')
          expect(ctx2).to.equal(instance[OzElementContextSymbol])
          expect(value2).to.equal('bar')
        })
      })
    })
    describe('#created()', () => {
      fit('called at element construction', () => {
        let value
        setElement({ created: _ => (value = true) })
        expect(value).to.equal(true)
      })
    })
    describe('#template', () => {
      it('append the template content to the element', () => {
        setElement({ template: _ => html`foo bar` })
        expect(instance.childNodes[0].data).to.equal('foo bar')
      })
      it('throw an error if template changed', () => {
        setElement({ template: ({ state: { foo } }) => foo ? html`foo bar` : html`bar baz` })
        expect(instance.childNodes[0].data).to.equal('bar baz')
        expect(_ => (instance[OzElementContextSymbol].state.foo = true)).to.throw()
      })
    })
    describe('#style', () => {
      it('append the style to the element', () => {
        setElement({ style: _ => css`.foo {}` })
        expect(Array.from(document.head.childNodes).pop().sheet.cssRules[0].selectorText).to.equal('.foo')
      })
      it('throw an error if template changed', () => {
        setElement({ style: ({ state: { foo } }) => foo ? css`.foo {}` : css`.bar {}` })
        expect(Array.from(document.head.childNodes).pop().sheet.cssRules[0].selectorText).to.equal('.bar')
        expect(_ => (instance[OzElementContextSymbol].state.foo = true)).to.throw()
      })
      xdescribe('scoped', () => {
        it('...', () => {
          setElement({ style: _ => css.scoped`.foo {}` })
          expect(Array.from(document.head.childNodes).pop().sheet.cssRules[0].selectorText).to.equal('.foo')
        })
      })
      describe('shadowDom', () => {
        it('correctly append the style in the the element\'s shadowRoot', () => {
          setElement({ shadowDom: 'open', style: _ => css`.foo {}` })
          expect(instance.shadowRoot.childNodes[0].sheet.cssRules[0].selectorText).to.equal('.foo')
        })
      })
    })
  })
})
