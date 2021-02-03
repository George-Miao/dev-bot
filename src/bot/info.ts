import { Composer } from 'telegraf'

import { Info } from '../util/info'

export default new Composer()
  .command('info', async (ctx, next) => {
    const info = new Info(ctx)

    const retStr = info
      .format(
        ...Info.compose(await info.me(), await info.chat(), await info.user()),
      )
      .join('\n\n')
    ctx.reply(retStr || 'No Info', { parse_mode: 'HTML' })
    await next()
  })
  .middleware()
