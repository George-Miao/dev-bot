import { Context } from 'telegraf'

import { at } from './index'

type InfoItem = [
  string,
  {
    [k: string]: undefined | String | Number
  },
]

const imgRegex = /cdn(\d)\.telesco\.pe\/file\/[a-zA-Z0-9_-]+\.jpg/

class Info {
  ctx: Context
  useTitle: Boolean
  constructor(ctx: Context, useTitle: Boolean = true) {
    this.ctx = ctx
    this.useTitle = useTitle
  }

  format(...items: InfoItem[]): String[] {
    return items.map(item => {
      const details = Object.entries(item[1])
        .map(([k, v]) => `<i>${k}</i>: ${v ?? 'unknown'}`)
        .join('\n')
      return this.useTitle ? `<b>[ ${item[0]} ]</b>\n${details}` : details
    })
  }

  static compose(...items: InfoItem[][]): InfoItem[] {
    const ret: InfoItem[] = []
    items.forEach(e => ret.push(...e))
    return ret
  }

  async getDC(
    format: (dc: Number) => any = dc =>
      dc > 0 ? 'Datacenter ' + dc : 'Unknown',
  ): Promise<any> {
    if (!this.ctx.from) return format(-1)
    return await fetch(`https://t.me/${this.ctx.from.username}`)
      .then(async x => await x.text())
      .then(x => x.match(imgRegex)?.[1] ?? '-1')
      .then(parseInt)
      .then(format)
  }

  async me(): Promise<InfoItem[]> {
    const me = await this.ctx.telegram.getMe()

    return [
      [
        'Bot',
        {
          ID: await this.ctx.tg.getMe().then(x => x.id),
          username: at(this.ctx.me),
          description: "Pop's TG bot for development",
        },
      ],
    ]
  }
  async user(): Promise<InfoItem[]> {
    const f = this.ctx.from
    return f
      ? [
          [
            'User',
            {
              ID: f.id,
              username: at(f.username),
            },
          ],
        ]
      : []
  }
  async inline(): Promise<InfoItem[]> {
    const iq = this.ctx.inlineQuery
    if (!iq) return []
    const from = iq.from
    return [
      [
        'Inline Query',
        {
          datacenter: await this.getDC(),
          query: iq.query === iq.query ? '<s>Empty</s>' : iq.query,
          user_id: from.id,
          name: `${from.first_name ?? ''} ${from.last_name ?? ''}`,
          username: at(iq.from.username),
          language_code: from.language_code,
        },
      ],
    ]
  }
  async chat(): Promise<InfoItem[]> {
    const c = this.ctx.chat
    if (!c) return []
    if (['group', 'supergroup'].includes(c.type)) {
      return [
        [
          'Group',
          {
            ID: c.id,
            title: c.title,
            username: at(c.username),
            members: await this.ctx.telegram.getChatMembersCount(c.id),
          },
        ],
      ]
    } else if (c.type === 'channel') {
      return [
        [
          'Channel',
          {
            ID: c.id,
            title: c.title,
            username: at(c.username),
            description: c.description,
            followers: await this.ctx.telegram.getChatMembersCount(c.id),
          },
        ],
      ]
    } else return []
  }
}

export { Info, InfoItem }
