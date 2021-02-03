import { Telegraf } from 'telegraf'

import secret from '../secrets'
import { greenLog } from '../util'
import infoMiddleware from './info'
import { Info } from '../util/info'

const bot = new Telegraf(secret.botToken)

bot.use(async (ctx, next) => {
  greenLog(
    `${ctx.from?.username ?? 'Unknown'} => ${ctx.message?.text ?? 'Unknown'}`,
    [ctx.updateType, ...ctx.updateSubTypes],
  )
  await next()
})

bot.on('inline_query', async ctx => {
  const info = new Info(ctx, false)
  const resp = info.format(...(await info.inline())).join('\n\n')
  const result = await ctx.answerInlineQuery(
    [
      {
        type: 'article',
        id: Math.random().toString(36).substr(2),
        title: 'Info',
        input_message_content: {
          message_text: resp,
          parse_mode: 'HTML',
        },
      },
    ],
    {
      cache_time: 0,
      is_personal: true,
    },
  )
  greenLog(
    result
      ? `InlineQuery ${ctx.inlineQuery?.id} answered`
      : `InlineQuery ${ctx.inlineQuery?.id} answer failed`,
  )
})

bot.use(infoMiddleware)

export default bot
