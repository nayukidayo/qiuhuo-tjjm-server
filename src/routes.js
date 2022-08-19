export default async f => {
  f.get(
    '/uplink',
    {
      schema: {
        query: {
          type: 'object',
          properties: {
            topic: { type: 'string', maxLength: 20 },
          },
          required: ['topic'],
        },
      },
    },
    async req => {
      const { topic } = req.query
      return { err: 0, data: f.getStore(topic) }
    }
  )

  f.post(
    '/downlink',
    {
      body: {
        type: 'object',
        properties: {
          topic: { type: 'string', maxLength: 20 },
          action: { type: 'string', maxLength: 5 },
        },
        required: ['topic', 'action'],
      },
    },
    async req => {
      const { topic, action } = req.body
      f.setAction(topic, action)
      return { err: 0 }
    }
  )
}
