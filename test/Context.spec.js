import React from 'react'
import * as yup from 'yup'
import { mount } from 'enzyme'

import Form from '../src'

describe('Form Context', () => {
  let schema = yup.object({
    name: yup.string().default(''),
  })

  it('should simulate an onSubmit in the Form', function(done) {
    mount(
      <Form
        onSubmit={sinon.spy(() => done())}
        schema={schema}
        defaultValue={{}}
      >
        <Form.Field name="name" type="text" className="test" />
        <Form.Button type="submit" />
      </Form>
    )
      .find(Form.Button)
      .simulate('click')
  })

  it('should simulate an onSubmit from outside the form', function(done) {
    mount(
      <Form.Context>
        <Form
          onSubmit={sinon.spy(() => done())}
          schema={schema}
          defaultValue={{}}
        >
          <Form.Field name="name" type="text" className="test" />
        </Form>
        <Form.Button type="submit" />
      </Form.Context>
    )
      .find(Form.Button)
      .simulate('click')
  })

  it('should simulate an onSubmit in correct Form', function(done) {
    mount(
      <Form.Context>
        <Form
          formKey="foo"
          onSubmit={() => setTimeout(() => done())}
          schema={schema}
          defaultValue={{}}
        >
          <Form.Field name="name" type="text" className="test" />
        </Form>
        <Form
          onSubmit={() => done(new Error('submitted wrong form!'))}
          schema={schema}
          defaultValue={{}}
        >
          <Form.Field name="name" type="text" className="test" />
        </Form>

        <Form.Button type="submit" formKey="foo" />
      </Form.Context>
    )
      .find(Form.Button)
      .simulate('click')
  })

  it('should track multiple forms per context', function(done) {
    let count = 0
    let spy = sinon.spy(() => {
      if (++count == 2) done()
    })

    mount(
      <Form.Context>
        <Form formKey="foo" onSubmit={spy} schema={schema} defaultValue={{}}>
          <Form.Field name="name" type="text" className="test" />
        </Form>
        <Form formKey="bar" onSubmit={spy} schema={schema} defaultValue={{}}>
          <Form.Field name="name" type="text" className="test" />
        </Form>
        <Form.Button type="submit" formKey="foo" />
        <Form.Button type="submit" formKey="bar" />
      </Form.Context>
    )
      .find(Form.Button)
      .map(n => n.simulate('click'))
  })

  it('should not submit to different channels', function(done) {
    let stub = sinon.stub(console, 'error')
    mount(
      <Form.Context>
        <Form
          formKey="foo"
          onSubmit={sinon.spy(() => {
            throw new Error()
          })}
          schema={schema}
          defaultValue={{}}
        >
          <Form.Field name="name" type="text" className="test" />
        </Form>
        <Form.Button type="submit" formKey="bar" />
      </Form.Context>
    )
      .find(Form.Button)
      .simulate('click')

    setTimeout(() => {
      stub.should.have.been.calledOnce();
      stub.restore();
      done()
    }, 10)

  })

  it('should fall-through to next context', done => {
    mount(
      <Form.Context>
        <Form
          schema={schema}
          defaultValue={{}}
          formKey="bar"
          onSubmit={() => setTimeout(() => done(), 10)}
        >
          <Form.Field name="name" type="text" className="test" />
        </Form>
        <Form.Context>
          <Form
            schema={schema}
            defaultValue={{}}
            onSubmit={() => {
              throw new Error()
            }}
          >
            <Form.Field name="name" type="text" className="test" />
          </Form>
          <Form.Button type="submit" formKey="bar" />
        </Form.Context>
      </Form.Context>
    )
      .find(Form.Button)
      .simulate('click')
  })

  it('should update subscribers', done => {
    mount(
      <Form.Context>
        <Form.Button type="submit" formKey="bar" />
        <Form
          schema={schema}
          defaultValue={{}}
          formKey="bar"
          onSubmit={() => done()}
        >
          {/* <Form.Field name="name" type="text" className="test" /> */}
        </Form>
      </Form.Context>
    )
      .find(Form.Button)
      .simulate('click')
  })

  it('should not allow submit past form', done => {
    mount(
      <Form.Context>
        <Form
          schema={schema}
          defaultValue={{}}
          onSubmit={() => done(new Error('submitted wrong form!'))}
        >
          <Form.Button type="submit" formKey="bar" />
          <Form.Field name="name" type="text" className="test" />
        </Form>
        <Form
          schema={schema}
          defaultValue={{}}
          formKey="bar"
          onSubmit={() => done()}
        >
          <Form.Field name="name" type="text" className="test" />
        </Form>
      </Form.Context>
    )
      .find(Form.Button)
      .simulate('click')
  })
})
